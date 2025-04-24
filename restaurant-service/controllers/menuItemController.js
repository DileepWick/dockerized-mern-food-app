// controllers/menuItemController.js
import MenuItem from '../models/menuItem.js';
import Restaurant from '../models/restaurant.js';
import { validateToken } from '../utils/validateUser.js';

// Create a new menu item (only for the restaurant the user owns)
export const createMenuItem = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const {
    restaurant_id,
    category,
    name,
    description,
    price,
    image_url,
    is_available,
  } = req.body;

  try {
    const restaurant = await Restaurant.findOne({ _id: restaurant_id });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.owner_id.toString() !== user.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const menuItem = await MenuItem.create({
      restaurant_id,
      category,
      name,
      description,
      price,
      image_url,
      is_available,
    });

    res.status(201).json(menuItem);
  } catch (err) {
    console.error('Error creating menu item:', err);
    res.status(500).json({ message: 'Failed to create menu item' });
  }
};

// Get all menu items
export const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.status(200).json(menuItems);
  } catch (err) {
    console.error('Error fetching menu items:', err);
    res.status(500).json({ message: 'Failed to fetch menu items' });
  }
};

// Get menu items by restaurant ID
export const getMenuItemsByRestaurantId = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ restaurant_id: req.params.id });
    res.status(200).json(menuItems);
  } catch (err) {
    console.error('Error fetching menu items by restaurant:', err);
    res.status(500).json({ message: 'Failed to fetch menu items' });
  }
};

// Get a single menu item by ID
export const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(200).json(item);
  } catch (err) {
    console.error('Error fetching menu item:', err);
    res.status(500).json({ message: 'Failed to fetch menu item' });
  }
};

// Update a menu item (only by the owner of the restaurant)
export const updateMenuItem = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const restaurant = await Restaurant.findById(menuItem.restaurant_id);
    if (restaurant.owner_id.toString() !== user.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { category, name, description, price, image_url, is_available } =
      req.body;

    if (category !== undefined) menuItem.category = category;
    if (name !== undefined) menuItem.name = name;
    if (description !== undefined) menuItem.description = description;
    if (price !== undefined) menuItem.price = price;
    if (image_url !== undefined) menuItem.image_url = image_url;
    if (is_available !== undefined) menuItem.is_available = is_available;

    await menuItem.save();

    res.status(200).json(menuItem);
  } catch (err) {
    console.error('Error updating menu item:', err);
    res.status(500).json({ message: 'Failed to update menu item' });
  }
};

// Delete a menu item (only by the owner of the restaurant)
export const deleteMenuItem = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem)
      return res.status(404).json({ message: 'Menu item not found' });

    const restaurant = await Restaurant.findById(menuItem.restaurant_id);
    if (restaurant.owner_id.toString() !== user.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await menuItem.deleteOne();
    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    console.error('Error deleting menu item:', err);
    res.status(500).json({ message: 'Failed to delete menu item' });
  }
};
