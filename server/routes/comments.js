const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const commentsController = require('../controllers/comments');
const { auth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

// @route   GET api/comments/post/:postId
// @desc    Get all comments for a post
// @access  Public
router.get('/post/:postId', commentsController.getCommentsByPost);

// @route   GET api/comments/:id
// @desc    Get comment by ID
// @access  Public
router.get('/:id', commentsController.getCommentById);

// @route   POST api/comments
// @desc    Create a new comment
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('post_id', 'Post ID is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty()
    ],
    validateRequest
  ],
  commentsController.createComment
);

// @route   PUT api/comments/:id
// @desc    Update a comment
// @access  Private (comment author or admin)
router.put(
  '/:id',
  [
    auth,
    [
      check('content', 'Content is required').not().isEmpty()
    ],
    validateRequest
  ],
  commentsController.updateComment
);

// @route   DELETE api/comments/:id
// @desc    Delete a comment
// @access  Private (comment author, post author, or admin)
router.delete('/:id', auth, commentsController.deleteComment);

module.exports = router;