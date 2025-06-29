const Comment = require('../models/comment');
const Post = require('../models/post');

// Get all comments for a post
exports.getCommentsByPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    
    // Check if post exists
    const post = await Post.getById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const comments = await Comment.getByPost(postId);
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get comment by ID
exports.getCommentById = async (req, res) => {
  try {
    const comment = await Comment.getById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { post_id, content } = req.body;
    
    // Check if post exists
    const post = await Post.getById(post_id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const comment = await Comment.create({
      post_id,
      user_id: req.user.id,
      content
    });
    
    res.status(201).json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update comment
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    // Check if comment exists
    const existingComment = await Comment.getById(req.params.id);
    if (!existingComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the author or admin
    if (existingComment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }
    
    const comment = await Comment.update(req.params.id, content);
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    // Check if comment exists
    const comment = await Comment.getById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the author, post author, or admin
    const post = await Post.getById(comment.post_id);
    if (comment.user_id !== req.user.id && post.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    await Comment.delete(req.params.id);
    res.json({ message: 'Comment removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};