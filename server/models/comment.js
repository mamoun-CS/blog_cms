const db = require('../db');

const Comment = {
  // Get all comments for a post
  getByPost: async (postId) => {
    const query = `
      SELECT c.*, u.name as user_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at DESC
    `;
    
    const result = await db.query(query, [postId]);
    return result.rows;
  },

  // Get comment by ID
  getById: async (id) => {
    const query = `
      SELECT c.*, u.name as user_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  // Create a new comment
  create: async (commentData) => {
    const { post_id, user_id, content } = commentData;
    
    const query = `
      INSERT INTO comments (post_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await db.query(query, [post_id, user_id, content]);
    
    // Get the complete comment with user info
    return await Comment.getById(result.rows[0].id);
  },

  // Update comment
  update: async (id, content) => {
    const query = 'UPDATE comments SET content = $1 WHERE id = $2 RETURNING *';
    const result = await db.query(query, [content, id]);
    
    // Get the complete comment with user info
    return await Comment.getById(result.rows[0].id);
  },

  // Delete comment
  delete: async (id) => {
    const query = 'DELETE FROM comments WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
};

module.exports = Comment;