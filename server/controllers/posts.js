const Post = require('../models/post');
const slugify = require('../utils/slugify');

// Get all posts with pagination
exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await Post.getAll(page, limit);
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.getById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get post by slug
exports.getPostBySlug = async (req, res) => {
  try {
    const post = await Post.getBySlug(req.params.slug);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, content, categories } = req.body;
    let { slug } = req.body;
    
    // Generate slug if not provided
    if (!slug) {
      slug = slugify(title);
    }
    
    // Get cover image path if uploaded
    const coverImage = req.file ? `/uploads/${req.file.filename}` : null;
    
    const post = await Post.create({
      user_id: req.user.id,
      title,
      content,
      slug,
      cover_image: coverImage,
      categories
    });
    
    res.status(201).json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const { title, content, categories } = req.body;
    let { slug } = req.body;
    
    // Check if post exists
    const existingPost = await Post.getById(req.params.id);
    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is the author or admin
    if (existingPost.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }
    
    // Generate slug if not provided
    if (!slug) {
      slug = slugify(title);
    }
    
    // Get cover image path if uploaded
    let coverImage = existingPost.cover_image;
    if (req.file) {
      coverImage = `/uploads/${req.file.filename}`;
    }
    
    const post = await Post.update(req.params.id, {
      title,
      content,
      slug,
      cover_image: coverImage,
      categories
    });
    
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    // Check if post exists
    const post = await Post.getById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is the author or admin
    if (post.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    await Post.delete(req.params.id);
    
    res.json({ message: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Search posts
exports.searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const result = await Post.search(q, page, limit);
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get posts by category
exports.getPostsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await Post.getByCategory(categoryId, page, limit);
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get posts by user
exports.getPostsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await Post.getByUser(userId, page, limit);
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};