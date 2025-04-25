import Restaurant from '../models/restaurant.js';
import { validateToken, getFullUser } from '../utils/validateUser.js';

// Create a new restaurant (user can only create one)
export const createRestaurant = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const { name, description, is_active, cover_image } = req.body;

  try {
    const existing = await Restaurant.findOne({ owner_id: user.userId });
    if (existing) {
      return res.status(400).json({ message: 'User already has a restaurant' });
    }

    const fullUserData = await getFullUser(token); // Use getFullUser here
    if (!fullUserData || !fullUserData.address?.postal_code) {
      return res.status(400).json({ message: 'User postal code not found' });
    }

    const restaurant = await Restaurant.create({
      owner_id: user.userId,
      name,
      description,
      is_active,
      postal_code: fullUserData.address.postal_code,
      cover_image: cover_image || '', // Add the cover image field
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

export const getRestaurantByOwnerId = async (req, res) => {
  const ownerId = req.params.id;

  try {
    const restaurant = await Restaurant.findOne({ owner_id: ownerId });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.status(200).json(restaurant);
  } catch (err) {
    console.error('Error fetching restaurant:', err);
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

    const { name, description, is_active, cover_image } = req.body;

    if (name !== undefined) restaurant.name = name;
    if (description !== undefined) restaurant.description = description;
    if (is_active !== undefined) restaurant.is_active = is_active;
    if (cover_image !== undefined) restaurant.cover_image = cover_image;

    await restaurant.save();

    res.status(200).json(restaurant);
  } catch (err) {
    console.error('Error updating restaurant:', err);
    res.status(500).json({ message: 'Failed to update restaurant' });
  }
};

// Get Cloudinary signature (for secure image uploads)
export const getCloudinarySignature = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    // Your Cloudinary credentials would be stored in environment variables
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = `snapbite/restaurants/${user.userId}`;

    // Create the signature using Cloudinary's API
    const crypto = require('crypto');
    const signature = crypto
      .createHash('sha1')
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    res.json({ signature, timestamp, apiKey, cloudName, folder });
  } catch (err) {
    console.error('Error generating Cloudinary signature:', err);
    res.status(500).json({ message: 'Failed to generate signature' });
  }
};
