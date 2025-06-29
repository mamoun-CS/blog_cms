const Category = require('../models/category');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.getById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    const category = await Category.create(name);
    res.status(201).json(category);
  } catch (err) {
    console.error(err.message);
    
    // Handle duplicate category name
    if (err.code === '23505') { // PostgreSQL unique violation error code
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    res.status(500).send('Server error');
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Check if category exists
    const existingCategory = await Category.getById(req.params.id);
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const category = await Category.update(req.params.id, name);
    res.json(category);
  } catch (err) {
    console.error(err.message);
    
    // Handle duplicate category name
    if (err.code === '23505') { // PostgreSQL unique violation error code
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    res.status(500).send('Server error');
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    // Check if category exists
    const category = await Category.getById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    await Category.delete(req.params.id);
    res.json({ message: 'Category removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};