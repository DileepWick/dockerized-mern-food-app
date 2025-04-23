import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Register controller
export const registerUser = async (req, res) => {
  try {
    const {
      username,
      first_name,
      last_name,
      email,
      phone_number,
      password,
      role,
      address,
    } = req.body;

    // ✅ Check required fields
    if (
      !username ||
      !first_name ||
      !last_name ||
      !email ||
      !phone_number ||
      !password
    ) {
      return res
        .status(400)
        .json({ message: 'All required fields must be provided' });
    }

    // ✅ Check for existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { phone_number }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({
          message: 'User already exists with this email or phone number',
        });
    }

    // ✅ Default role to 'user' if not provided
    const userRole = role || 'user';

    // ✅ Create user
    const newUser = new User({
      username,
      first_name,
      last_name,
      email,
      phone_number,
      password,
      role: userRole,
      address,
    });

    await newUser.save();

    // ✅ Generate token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        is_verified: newUser.is_verified,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login controller
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // ✅ Compare password using schema method
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    // ✅ Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // ✅ Set cookie (optional, based on your frontend)
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: 3600000,
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout controller
export const logoutUser = (req, res) => {
  try {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Validate token controller
export const validateToken = (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded });
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
