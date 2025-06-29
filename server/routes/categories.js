const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const categoriesController = require('../controllers/categories');
const { auth, admin } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

// @route   GET api/categories
// @desc    Get all categories
// @access  Public
router.get('/', categoriesController.getAllCategories);

// @route   GET api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', categoriesController.getCategoryById);

// @route   POST api/categories
// @desc    Create a new category
// @access  Private (admin only)
router.post(
  '/',
  [
    auth,
    admin,
    [
      check('name', 'Name is required').not().isEmpty()
    ],
    validateRequest
  ],
  categoriesController.createCategory
);

// @route   PUT api/categories/:id
// @desc    Update a category
// @access  Private (admin only)
router.put(
  '/:id',
  [
    auth,
    admin,
    [
      check('name', 'Name is required').not().isEmpty()
    ],
    validateRequest
  ],
  categoriesController.updateCategory
);

// @route   DELETE api/categories/:id
// @desc    Delete a category
// @access  Private (admin only)
router.delete('/:id', [auth, admin], categoriesController.deleteCategory);

module.exports = router;