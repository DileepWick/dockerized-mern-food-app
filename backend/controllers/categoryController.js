import Category from "../models/Category.js";

/** ✅ Create a new category */
export const createCategory = async (req, res) => {
    try {
      const { name, type } = req.body;
  
      if (!name || !type) {
        return res.status(400).json({ message: "Name and type are required" });
      }
  
      // Get userId from req.user (set by JWT middleware)
      const userId = req.user?.userId; 
  
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
      }
  
      // Check if the category already exists for the user
      const existingCategory = await Category.findOne({ userId, name });
      if (existingCategory) {
        return res.status(400).json({ message: "Category already exists!" });
      }
  
      // Create the new category
      const category = new Category({ userId, name, type });
      await category.save();
  
      res.status(201).json(category);
    } catch (error) {
      console.error("Error in createCategory:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  

/** ✅ Get all categories for a user */
export const getCategories = async (req, res) => {
  try {
    // Get userId from req.user (set by JWT middleware)
    const userId = req.user?.userId; 
    console.log(userId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const categories = await Category.find({ userId: userId });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** ✅ Update a category */
export const updateCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, type },
      { new: true }
    );

    if (!category) return res.status(404).json({ message: "Category not found" });

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** ✅ Delete a category */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!category) return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
