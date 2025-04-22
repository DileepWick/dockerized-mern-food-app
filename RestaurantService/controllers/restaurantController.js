// controllers/restaurantController.js
import Restaurant from '../models/restaurant.js';
import { validateToken } from '../utils/validateUser.js';

// Create a new restaurant (user can only create one)
export const createRestaurant = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const { name, description, is_active } = req.body;

  try {
    const existing = await Restaurant.findOne({ owner_id: user.userId });
    if (existing) {
      return res.status(400).json({ message: 'User already has a restaurant' });
    }

    const restaurant = await Restaurant.create({
      owner_id: user.userId,
      name,
      description,
      is_active,
    });

    res.status(201).json(restaurant);
  } catch (err) {
    console.error('Error creating restaurant:', err);
    res.status(500).json({ message: 'Failed to create restaurant' });
  }
};

// Get all restaurants
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.status(200).json(restaurants);
  } catch (err) {
    console.error('Error retrieving restaurants:', err);
    res.status(500).json({ message: 'Failed to fetch restaurants' });
  }
};

// Get a single restaurant by ID
export const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.status(200).json(restaurant);
  } catch (err) {
    console.error('Error retrieving restaurant:', err);
    res.status(500).json({ message: 'Failed to fetch restaurant' });
  }
};

// Update restaurant (only if owned by the user)
export const updateRestaurant = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.owner_id.toString() !== user.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, description, is_active } = req.body;

    if (name !== undefined) restaurant.name = name;
    if (description !== undefined) restaurant.description = description;
    if (is_active !== undefined) restaurant.is_active = is_active;

    await restaurant.save();

    res.status(200).json(restaurant);
  } catch (err) {
    console.error('Error updating restaurant:', err);
    res.status(500).json({ message: 'Failed to update restaurant' });
  }
};

export const checkOwnership = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const restaurant = await Restaurant.findOne({ owner_id: user.userId });
    res.status(200).json({ hasRestaurant: !!restaurant });
  } catch (err) {
    console.error('Error checking ownership:', err);
    res.status(500).json({ message: 'Failed to check ownership' });
  }
};
