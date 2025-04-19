import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Register controller
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // 🔹 Check if all required fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔹 Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }


    // 🔹 Default role to "user" if not provided
    const userRole = role || "user";

    // 🔹 Create new user
    const newUser = new User({
      username,
      email,
      password:password,
      role: userRole,
    });

    await newUser.save();

    // 🔹 Generate JWT token (expires in 7 days)
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      token, // 🔥 Send JWT so user can login automatically
    });

  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Login controller
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Store JWT in HTTP-only cookie (prevents XSS attacks)
    res.cookie("token", token, {
      httpOnly: true, 
      sameSite: "Strict",
      maxAge: 3600000, // 1 hour
    });

    // Send user data (excluding sensitive fields)
    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, email: user.email, role: user.role ,token : token},
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Logout controller
export const logoutUser = (req, res) => {
  try {
    res.cookie("token", "", { httpOnly: true, expires: new Date(0) }); // Expire cookie
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

