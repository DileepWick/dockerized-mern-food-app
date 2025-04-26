// controllers/orderController.js
import Order from "../models/order.js";
import { validateToken } from "../utils/validateUser.js";
import { getMenuItemDetails, getRestaurantDetails } from "../utils/menuService.js";

export const createOrder = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  if (user.role !== 'user') return res.status(403).json({ message: "Only users can place orders" });

  try {
    const {
      owner_id,
      restaurant_id,
      postal_code,
      items
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: "Order must contain at least one item" });
    }

    // Validate restaurant_id by fetching restaurant details
    try {
      const restaurantDetails = await getRestaurantDetails(restaurant_id);
      if (!restaurantDetails) {
        return res.status(400).json({ message: "Invalid restaurant ID" });
      }
    } catch (error) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const order_id = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Process order items and validate with restaurant service
    const orderItems = [];
    let totalAmount = 0;
    
    for (const item of items) {
      try {
        // Fetch menu item details from restaurant service
        const menuItem = await getMenuItemDetails(item.menu_item_id);
        
        const orderItem = {
          order_item_id: `ITEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          price_per_item: menuItem.price,
          total_price: menuItem.price * item.quantity
        };
        
        totalAmount += orderItem.total_price;
        orderItems.push(orderItem);
      } catch (error) {
        return res.status(400).json({ message: `Invalid menu item: ${item.menu_item_id}` });
      }
    }

    const order = await Order.create({
      order_id,
      user_id: user.userId,
      restaurant_id,
      postal_code,
      total_amount: totalAmount,
      items: orderItems,
      status: 'PENDING',
      payment_status: 'UNPAID',
      modification_deadline: new Date(Date.now() + 15 * 60000) // 15 minutes from now
    });

    const restaurantDetails = await getRestaurantDetails(restaurant_id);

    res.status(201).json({
      orderDetails: order,
      restaurant: restaurantDetails
    });
    
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
};

export const getOrder = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const order = await Order.findOne({ order_id: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check user permissions based on role
    if (user.role === 'user' && order.user_id !== user.userId) {
      return res.status(403).json({ message: "Unauthorized to view this order" });
    } else if (user.role === 'seller' && order.restaurant_id !== user.userId) {
      return res.status(403).json({ message: "Unauthorized to view this order" });
    } else if (user.role === 'driver' && order.status !== 'APPROVED' && order.status !== 'PREPARED' && order.status !== 'PICKED_UP') {
      return res.status(403).json({ message: "Unauthorized to view this order" });
    }

    // Get restaurant details
    try {
      const restaurantDetails = await getRestaurantDetails(order.restaurant_id);
      order._doc.restaurant = restaurantDetails;
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
      // Continue with order data even if restaurant details can't be fetched
    }

    res.status(200).json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

export const updateOrderStatus = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const order = await Order.findOne({ order_id: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Validate permissions based on role
    if (user.role === 'user') {
      if (req.body.status !== 'CANCELLED') {
        return res.status(403).json({ message: "Users can only cancel orders" });
      }
      if (order.status !== 'PENDING') {
        return res.status(400).json({ message: "Order can only be cancelled while PENDING" });
      }
      
    } else if (user.role === 'seller') {
      // Remove CONFIRMED from allowed statuses for sellers
      if (!['APPROVED', 'PREPARED', 'CANCELLED'].includes(req.body.status)) {
        return res.status(403).json({ message: "Seller can only approve, prepare or cancel orders" });
      }
      
      
      // Special handling for APPROVED status
      if (req.body.status === 'APPROVED' && order.status !== 'CONFIRMED') {
        return res.status(400).json({ message: "Order must be confirmed by user before approval" });
      }
    } else if (user.role === 'driver') {
      if (!['PICKED_UP', 'DELIVERED'].includes(req.body.status)) {
        return res.status(403).json({ message: "Driver can only mark as picked up or delivered" });
      }
    }

    // Validate status transitions
    const statusFlow = ['PENDING', 'CONFIRMED', 'APPROVED', 'PREPARED', 'PICKED_UP', 'DELIVERED'];
    const currentIndex = statusFlow.indexOf(order.status);
    const newIndex = statusFlow.indexOf(req.body.status);
    
    if (req.body.status === 'CANCELLED') {
      // Special handling for cancellation
      if (user.role === 'user' && order.status !== 'PENDING') {
        return res.status(400).json({ message: "Users can only cancel pending orders" });
      }
      if (user.role === 'seller' && !['PENDING', 'CONFIRMED'].includes(order.status)) {
        return res.status(400).json({ message: "Sellers can only cancel pending or confirmed orders" });
      }
    } else if (newIndex <= currentIndex || newIndex - currentIndex > 1) {
      // Exception for seller approving a confirmed order
      if (!(user.role === 'seller' && order.status === 'CONFIRMED' && req.body.status === 'APPROVED')) {
        // Ensure proper status progression (one step at a time)
        return res.status(400).json({ message: "Invalid status transition" });
      }
    }

    // Update order status
    order.status = req.body.status;
    
    // Set estimated delivery time for approved orders (moved from CONFIRMED to APPROVED)
    if (req.body.status === 'APPROVED' && !order.estimated_delivery_time) {
      order.estimated_delivery_time = new Date(Date.now() + 45 * 60000); // 45 minutes from now
    }
    
    // Update if provided
    if (req.body.estimated_delivery_time) {
      order.estimated_delivery_time = req.body.estimated_delivery_time;
    }

    await order.save();
    res.status(200).json(order);
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
};


export const getOrdersByUser = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  if (user.role !== 'user') return res.status(403).json({ message: "Only users can access this endpoint" });

  try {
    const orders = await Order.find({ user_id: user.userId }).sort({ placed_at: -1 });
    
    // Fetch restaurant details for each order
    const ordersWithRestaurants = await Promise.all(orders.map(async (order) => {
      const orderObj = order.toObject();
      try {
        orderObj.restaurant = await getRestaurantDetails(order.restaurant_id);
      } catch (error) {
        console.error(`Error fetching restaurant details for order ${order.order_id}:`, error);
      }
      return orderObj;
    }));
    
    res.status(200).json(ordersWithRestaurants);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ message: "Failed to fetch user orders" });
  }
};

export const getOrdersByRestaurant = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  if (user.role !== 'seller') return res.status(403).json({ message: "Only sellers can view their restaurant orders" });

  try {
    const restaurantId = req.params.restaurantId || user.userId;
    
    // If requesting another restaurant's orders
    
    
    // Fetch restaurant details
    let restaurantDetails;
    try {
      restaurantDetails = await getRestaurantDetails(restaurantId);
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
      // Continue without restaurant details
    }
    
    const orders = await Order.find({ restaurant_id: restaurantId }).sort({ placed_at: -1 });
    
    const response = {
      restaurant: restaurantDetails,
      orders: orders
    };
    
    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching restaurant orders:", err);
    res.status(500).json({ message: "Failed to fetch restaurant orders" });
  }
};

export const getOrdersByPostalCode = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  
  // Remove this line to allow any authenticated user to access
  // if (user.role !== 'driver') return res.status(403).json({ message: "Only drivers can access this endpoint" });

  try {
    const { postalCode } = req.params;
    const { status } = req.query;
    
    const query = { postal_code: postalCode };
    
    // Filter by status if provided
    if (status) {
      // Remove driver-specific status validation
      // if (!['APPROVED', 'PREPARED', 'PICKED_UP'].includes(status)) {
      //   return res.status(400).json({ message: "Invalid status filter for drivers" });
      // }
      query.status = status;
    } else {
      // Show all orders instead of only driver-ready ones
      // query.status = { $in: ['APPROVED', 'PREPARED', 'PICKED_UP'] };
    }
    
    const orders = await Order.find(query).sort({ placed_at: -1 });
    
    // Fetch restaurant details for each order
    const ordersWithRestaurants = await Promise.all(orders.map(async (order) => {
      const orderObj = order.toObject();
      try {
        orderObj.restaurant = await getRestaurantDetails(order.restaurant_id);
      } catch (error) {
        console.error(`Error fetching restaurant details for order ${order.order_id}:`, error);
      }
      return orderObj;
    }));
    
    res.status(200).json(ordersWithRestaurants);
  } catch (err) {
    console.error("Error fetching orders by postal code:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const modifyPendingOrder = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  if (user.role !== 'user') return res.status(403).json({ message: "Only users can modify orders" });

  try {
    const order = await Order.findOne({ order_id: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: "Only pending orders can be modified" });
    }

    if (order.user_id !== user.userId) {
      return res.status(403).json({ message: "Unauthorized to modify this order" });
    }

    // Check if modification deadline has passed
    if (Date.now() > order.modification_deadline) {
      return res.status(400).json({ message: "Modification time limit exceeded" });
    }

    const { items } = req.body;
    
    if (!items || !items.length) {
      return res.status(400).json({ message: "Order must contain at least one item" });
    }

    // Process and validate new items
    const orderItems = [];
    let totalAmount = 0;
    
    for (const item of items) {
      try {
        // Fetch menu item details from restaurant service
        const menuItem = await getMenuItemDetails(item.menu_item_id);
        
        const orderItem = {
          order_item_id: item.order_item_id || `ITEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          price_per_item: menuItem.price,
          total_price: menuItem.price * item.quantity
        };
        
        totalAmount += orderItem.total_price;
        orderItems.push(orderItem);
      } catch (error) {
        return res.status(400).json({ message: `Invalid menu item: ${item.menu_item_id}` });
      }
    }

    order.items = orderItems;
    order.total_amount = totalAmount;

    await order.save();
    res.status(200).json(order);
  } catch (err) {
    console.error("Error modifying order:", err);
    res.status(500).json({ message: "Failed to modify order" });
  }
};

export const addOrderItem = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  if (user.role !== 'user') return res.status(403).json({ message: "Only users can modify orders" });

  try {
    const order = await Order.findOne({ order_id: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: "Only pending orders can be modified" });
    }

    if (order.user_id !== user.userId) {
      return res.status(403).json({ message: "Unauthorized to modify this order" });
    }

    // Check if modification deadline has passed
    if (Date.now() > order.modification_deadline) {
      return res.status(400).json({ message: "Modification time limit exceeded" });
    }

    const { menu_item_id, quantity } = req.body;
    
    if (!menu_item_id || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid item details" });
    }

    // Fetch menu item details from restaurant service
    try {
      const menuItem = await getMenuItemDetails(menu_item_id);
      
      const newItem = {
        order_item_id: `ITEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        menu_item_id,
        quantity,
        price_per_item: menuItem.price,
        total_price: menuItem.price * quantity
      };

      order.items.push(newItem);
      order.total_amount = recalculateOrderTotal(order.items);

      await order.save();
      res.status(200).json(order);
    } catch (error) {
      return res.status(400).json({ message: "Invalid menu item" });
    }
  } catch (err) {
    console.error("Error adding order item:", err);
    res.status(500).json({ message: "Failed to add order item" });
  }
};

export const removeOrderItem = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  if (user.role !== 'user') return res.status(403).json({ message: "Only users can modify orders" });

  try {
    const order = await Order.findOne({ order_id: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: "Only pending orders can be modified" });
    }

    if (order.user_id !== user.userId) {
      return res.status(403).json({ message: "Unauthorized to modify this order" });
    }

    // Check if modification deadline has passed
    if (Date.now() > order.modification_deadline) {
      return res.status(400).json({ message: "Modification time limit exceeded" });
    }

    const { order_item_id } = req.body;
    
    if (!order_item_id) {
      return res.status(400).json({ message: "Order item ID is required" });
    }

    // Ensure at least one item remains after removal
    if (order.items.length <= 1) {
      return res.status(400).json({ message: "Order must contain at least one item" });
    }

    order.items = order.items.filter(item => item.order_item_id !== order_item_id);
    order.total_amount = recalculateOrderTotal(order.items);

    await order.save();
    res.status(200).json(order);
  } catch (err) {
    console.error("Error removing order item:", err);
    res.status(500).json({ message: "Failed to remove order item" });
  }
};

export const updateItemQuantity = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  if (user.role !== 'user') return res.status(403).json({ message: "Only users can modify orders" });

  try {
    const order = await Order.findOne({ order_id: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: "Only pending orders can be modified" });
    }

    if (order.user_id !== user.userId) {
      return res.status(403).json({ message: "Unauthorized to modify this order" });
    }

    // Check if modification deadline has passed
    if (Date.now() > order.modification_deadline) {
      return res.status(400).json({ message: "Modification time limit exceeded" });
    }

    const { order_item_id, quantity } = req.body;
    
    if (!order_item_id || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid update details" });
    }

    const itemIndex = order.items.findIndex(item => item.order_item_id === order_item_id);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Order item not found" });
    }

    order.items[itemIndex].quantity = quantity;
    order.items[itemIndex].total_price = order.items[itemIndex].price_per_item * quantity;
    order.total_amount = recalculateOrderTotal(order.items);

    await order.save();
    res.status(200).json(order);
  } catch (err) {
    console.error("Error updating item quantity:", err);
    res.status(500).json({ message: "Failed to update item quantity" });
  }
};

export const confirmOrder = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  if (user.role !== 'user') return res.status(403).json({ message: "Only users can confirm their orders" });

  try {
    const order = await Order.findOne({ order_id: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: "Only pending orders can be confirmed" });
    }

    if (order.user_id !== user.userId) {
      return res.status(403).json({ message: "Unauthorized to confirm this order" });
    }

    // Get restaurant details before confirming
    try {
      const restaurantDetails = await getRestaurantDetails(order.restaurant_id);
      // We can use restaurant details here if needed for any business logic
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
      // Continue with confirmation even if restaurant details can't be fetched
    }

    order.status = 'CONFIRMED';
    order.modification_deadline = new Date(); // Lock modifications

    await order.save();
    res.status(200).json(order);
  } catch (err) {
    console.error("Error confirming order:", err);
    res.status(500).json({ message: "Failed to confirm order" });
  }
};

// Helper function to recalculate order total
const recalculateOrderTotal = (items) => {
  return items.reduce((total, item) => total + item.total_price, 0);
};
