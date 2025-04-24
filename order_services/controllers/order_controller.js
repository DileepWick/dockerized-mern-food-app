import Order from "../models/order.js";
import { validateToken } from "../utils/validateUser.js";

// Helper function to recalculate order total
const recalculateOrderTotal = (items) => {
  return items.reduce((total, item) => total + item.price_per_item * item.quantity, 0);
};

export const createOrder = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  if (user.role !== 'user') return res.status(403).json({ message: "Only customers can place orders" });

  try {
    const {
      restaurant_id,
      delivery_address_id,
      total_amount,
      items
    } = req.body;

    const order_id = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await Order.create({
      order_id,
      user_id: user.userId,
      restaurant_id,
      delivery_address_id,
      total_amount,
      items,
      status: 'PENDING',
      payment_status: 'UNPAID',
      modification_deadline: new Date(Date.now() + 15 * 60000) // 15 minutes from now
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
};

/**
 * Retrieves a specific order by ID
 * GET /api/orders/:orderId
 * Access: Order owner, Admin, or Restaurant
 */
export const getOrder = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const order = await Order.findOne({ order_id: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user_id !== user.userId && user.role !== 'ADMIN' && user.role !== 'RESTAURANT') {
      return res.status(403).json({ message: "Unauthorized to view this order" });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

/**
 * Updates the status of an order
 * PATCH /api/orders/:orderId/status
 * Access: Role-based permissions
 */
export const updateOrderStatus = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const order = await Order.findOne({ order_id: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (user.role === 'CUSTOMER') {
      if (req.body.status !== 'CANCELLED') {
        return res.status(403).json({ message: "Customers can only cancel orders" });
      }
      if (order.status !== 'PENDING') {
        return res.status(400).json({ message: "Order can only be cancelled while PENDING" });
      }
    } else if (user.role === 'RESTAURANT') {
      if (!['APPROVED', 'PREPARED'].includes(req.body.status)) {
        return res.status(403).json({ message: "Restaurant can only approve or mark as prepared" });
      }
      if (order.restaurant_id !== user.userId) {
        return res.status(403).json({ message: "Unauthorized to update this order" });
      }
    } else if (user.role === 'DELIVERY') {
      if (!['PICKED_UP', 'DELIVERED'].includes(req.body.status)) {
        return res.status(403).json({ message: "Delivery can only mark as picked up or delivered" });
      }
    }

    order.status = req.body.status;
    if (req.body.estimated_delivery_time) {
      order.estimated_delivery_time = req.body.estimated_delivery_time;
    }

    await order.save();
    res.status(200).json(order);
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ message: "Failed to update order" });
  }
};

/**
 * Retrieves all orders for the authenticated user
 * GET /api/orders/user
 * Access: Any authenticated user
 */
export const getOrdersByUser = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const orders = await Order.find({ user_id: user.userId });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ message: "Failed to fetch user orders" });
  }
};

/**
 * Retrieves all orders for a restaurant
 * GET /api/orders/restaurant
 * Access: Restaurant users only
 */
export const getOrdersByRestaurant = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  if (user.role !== 'RESTAURANT') return res.status(403).json({ message: "Only restaurants can view their orders" });

  try {
    const orders = await Order.find({ restaurant_id: user.userId });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching restaurant orders:", err);
    res.status(500).json({ message: "Failed to fetch restaurant orders" });
  }
};

// New controller method for modifying pending orders
export const modifyPendingOrder = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const order = await Order.findOne({ order_id: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: "Only pending orders can be modified" });
    }

    if (order.user_id !== user.userId && user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Unauthorized to modify this order" });
    }

    // Check if modification deadline has passed
    if (Date.now() > order.modification_deadline) {
      return res.status(400).json({ message: "Modification time limit exceeded" });
    }

    const { items, delivery_address_id } = req.body;

    if (items) {
      order.items = items;
      order.total_amount = recalculateOrderTotal(items);
    }

    if (delivery_address_id) {
      order.delivery_address_id = delivery_address_id;
    }

    await order.save();
    res.status(200).json(order);
  } catch (err) {
    console.error("Error modifying order:", err);
    res.status(500).json({ message: "Failed to modify order" });
  }
};

// Additional granular endpoints for adding, removing, updating items
export const addOrderItem = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const order = await Order.findOne({ order_id: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: "Only pending orders can be modified" });
    }

    if (order.user_id !== user.userId && user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Unauthorized to modify this order" });
    }

    // Check if modification deadline has passed
    if (Date.now() > order.modification_deadline) {
      return res.status(400).json({ message: "Modification time limit exceeded" });
    }

    const newItem = {
      order_item_id: `ITEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      menu_item_id: req.body.menu_item_id,
      quantity: req.body.quantity,
      price_per_item: req.body.price_per_item,
      total_price: req.body.price_per_item * req.body.quantity
    };

    order.items.push(newItem);
    order.total_amount = recalculateOrderTotal(order.items);

    await order.save();
    res.status(200).json(order);
  } catch (err) {
    console.error("Error adding order item:", err);
    res.status(500).json({ message: "Failed to add order item" });
  }
};

export const removeOrderItem = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const order = await Order.findOne({ order_id: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: "Only pending orders can be modified" });
    }

    if (order.user_id !== user.userId && user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Unauthorized to modify this order" });
    }

    // Check if modification deadline has passed
    if (Date.now() > order.modification_deadline) {
      return res.status(400).json({ message: "Modification time limit exceeded" });
    }

    const { order_item_id } = req.body;
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

  try {
    const order = await Order.findOne({ order_id: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: "Only pending orders can be modified" });
    }

    if (order.user_id !== user.userId && user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Unauthorized to modify this order" });
    }

    // Check if modification deadline has passed
    if (Date.now() > order.modification_deadline) {
      return res.status(400).json({ message: "Modification time limit exceeded" });
    }

    const { order_item_id, quantity } = req.body;
    const item = order.items.find(i => i.order_item_id === order_item_id);
    if (!item) {
      return res.status(404).json({ message: "Order item not found" });
    }

    item.quantity = quantity;
    item.total_price = item.price_per_item * quantity;
    order.total_amount = recalculateOrderTotal(order.items);

    await order.save();
    res.status(200).json(order);
  } catch (err) {
    console.error("Error updating item quantity:", err);
    res.status(500).json({ message: "Failed to update item quantity" });
  }
};

// New endpoint to confirm order
export const confirmOrder = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const order = await Order.findOne({ order_id: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: "Only pending orders can be confirmed" });
    }

    if (order.user_id !== user.userId && user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Unauthorized to confirm this order" });
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
