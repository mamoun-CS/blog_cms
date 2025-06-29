const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const postsController = require('../controllers/posts');
const { auth, admin } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const upload = require('../middleware/upload');

// @route   GET api/posts
// @desc    Get all posts with pagination
// @access  Public
router.get('/', postsController.getAllPosts);

// @route   GET api/posts/search
// @desc    Search posts
// @access  Public
router.get('/search', postsController.searchPosts);

// @route   GET api/posts/category/:categoryId
// @desc    Get posts by category
// @access  Public
router.get('/category/:categoryId', postsController.getPostsByCategory);

// @route   GET api/posts/user/:userId
// @desc    Get posts by user
// @access  Public
router.get('/user/:userId', postsController.getPostsByUser);

// @route   GET api/posts/:id
// @desc    Get post by ID
// @access  Public
router.get('/:id', postsController.getPostById);

// @route   GET api/posts/slug/:slug
// @desc    Get post by slug
// @access  Public
router.get('/slug/:slug', postsController.getPostBySlug);

// @route   POST api/posts
// @desc    Create a new post
// @access  Private (admin only)
router.post(
  '/',
  [
    auth,
    admin,
    upload.single('cover_image'),
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty()
    ],
    validateRequest
  ],
  postsController.createPost
);

// @route   PUT api/posts/:id
// @desc    Update a post
// @access  Private (admin or post author)
router.put(
  '/:id',
  [
    auth,
    upload.single('cover_image'),
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty()
    ],
    validateRequest
  ],
  postsController.updatePost
);

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private (admin or post author)
router.delete('/:id', auth, postsController.deletePost);

module.exports = router;