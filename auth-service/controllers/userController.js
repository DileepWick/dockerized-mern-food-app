import mongoose from 'mongoose';
import User from '../models/User.js';

// Get user by ID controller
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Find user by ID and exclude password
    const user = await User.findById(userId).select('-password');

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        is_verified: user.is_verified,
        address: user.address,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserVerification = async (req, res) => {
  const userId = req.params.id;
  const { is_verified } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { is_verified },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User verification updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user verification error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Get all users error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user by ID
export const deleteUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
