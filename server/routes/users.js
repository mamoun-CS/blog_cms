const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const usersController = require('../controllers/users');
const { auth, admin } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

// @route   GET api/users
// @desc    Get all users
// @access  Private (admin only)
router.get('/', [auth, admin], usersController.getAllUsers);

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', usersController.getUserById);

// @route   PUT api/users/:id
// @desc    Update a user
// @access  Private (user themselves or admin)
router.put(
  '/:id',
  [
    auth,
    [
      check('name', 'Name is required').optional().not().isEmpty(),
      check('email', 'Please include a valid email').optional().isEmail(),
      check('password', 'Please enter a password with 6 or more characters').optional().isLength({ min: 6 })
    ],
    validateRequest
  ],
  usersController.updateUser
);

// @route   DELETE api/users/:id
// @desc    Delete a user
// @access  Private (user themselves or admin)
router.delete('/:id', auth, usersController.deleteUser);

module.exports = router;