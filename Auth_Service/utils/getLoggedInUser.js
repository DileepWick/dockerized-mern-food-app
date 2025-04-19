import User from "../models/User.js";

export const getLoggedInUser = async (req, res) => {
  try {
    // Fetch user by userId from the token (attached by verifyToken middleware)
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user); // Return user data excluding password
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export default getLoggedInUser;
