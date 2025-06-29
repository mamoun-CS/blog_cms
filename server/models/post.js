const db = require('../db');

const Post = {
  // Get all posts with pagination
  getAll: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT p.*, u.name as author_name, 
        (SELECT json_agg(c.*) FROM categories c 
         JOIN post_categories pc ON c.id = pc.category_id 
         WHERE pc.post_id = p.id) as categories,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const countQuery = 'SELECT COUNT(*) FROM posts';
    
    const [posts, countResult] = await Promise.all([
      db.query(query, [limit, offset]),
      db.query(countQuery)
    ]);
    
    const totalPosts = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalPosts / limit);
    
    return {
      posts: posts.rows,
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages
      }
    };
  },

  // Get post by ID
  getById: async (id) => {
    const query = `
      SELECT p.*, u.name as author_name, 
        (SELECT json_agg(c.*) FROM categories c 
         JOIN post_categories pc ON c.id = pc.category_id 
         WHERE pc.post_id = p.id) as categories
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  // Get post by slug
  getBySlug: async (slug) => {
    const query = `
      SELECT p.*, u.name as author_name, 
        (SELECT json_agg(c.*) FROM categories c 
         JOIN post_categories pc ON c.id = pc.category_id 
         WHERE pc.post_id = p.id) as categories
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.slug = $1
    `;
    
    const result = await db.query(query, [slug]);
    return result.rows[0];
  },

  // Create a new post
  create: async (postData) => {
    const { user_id, title, content, slug, cover_image, categories } = postData;
    
    // Start a transaction
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert post
      const postQuery = `
        INSERT INTO posts (user_id, title, content, slug, cover_image, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *
      `;
      
      const postValues = [user_id, title, content, slug, cover_image];
      const postResult = await client.query(postQuery, postValues);
      const post = postResult.rows[0];
      
      // Insert categories if provided
      if (categories && categories.length > 0) {
        const categoryValues = categories.map(categoryId => {
          return `(${post.id}, ${categoryId})`;
        }).join(', ');
        
        const categoryQuery = `
          INSERT INTO post_categories (post_id, category_id)
          VALUES ${categoryValues}
        `;
        
        await client.query(categoryQuery);
      }
      
      await client.query('COMMIT');
      
      // Get the complete post with categories
      return await Post.getById(post.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Update post
  update: async (id, postData) => {
    const { title, content, slug, cover_image, categories } = postData;
    
    // Start a transaction
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update post
      const postQuery = `
        UPDATE posts
        SET title = $1, content = $2, slug = $3, cover_image = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `;
      
      const postValues = [title, content, slug, cover_image, id];
      const postResult = await client.query(postQuery, postValues);
      
      // Delete existing category relationships
      await client.query('DELETE FROM post_categories WHERE post_id = $1', [id]);
      
      // Insert new categories if provided
      if (categories && categories.length > 0) {
        const categoryValues = categories.map(categoryId => {
          return `(${id}, ${categoryId})`;
        }).join(', ');
        
        const categoryQuery = `
          INSERT INTO post_categories (post_id, category_id)
          VALUES ${categoryValues}
        `;
        
        await client.query(categoryQuery);
      }
      
      await client.query('COMMIT');
      
      // Get the complete post with categories
      return await Post.getById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Delete post
  delete: async (id) => {
    const query = 'DELETE FROM posts WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  // Search posts
  search: async (searchTerm, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT p.*, u.name as author_name, 
        (SELECT json_agg(c.*) FROM categories c 
         JOIN post_categories pc ON c.id = pc.category_id 
         WHERE pc.post_id = p.id) as categories,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.title ILIKE $1 OR p.content ILIKE $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = `
      SELECT COUNT(*) FROM posts
      WHERE title ILIKE $1 OR content ILIKE $1
    `;
    
    const searchPattern = `%${searchTerm}%`;
    
    const [posts, countResult] = await Promise.all([
      db.query(query, [searchPattern, limit, offset]),
      db.query(countQuery, [searchPattern])
    ]);
    
    const totalPosts = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalPosts / limit);
    
    return {
      posts: posts.rows,
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages
      }
    };
  },

  // Get posts by category
  getByCategory: async (categoryId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT p.*, u.name as author_name, 
        (SELECT json_agg(c.*) FROM categories c 
         JOIN post_categories pc ON c.id = pc.category_id 
         WHERE pc.post_id = p.id) as categories,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN post_categories pc ON p.id = pc.post_id
      WHERE pc.category_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = `
      SELECT COUNT(*) FROM posts p
      JOIN post_categories pc ON p.id = pc.post_id
      WHERE pc.category_id = $1
    `;
    
    const [posts, countResult] = await Promise.all([
      db.query(query, [categoryId, limit, offset]),
      db.query(countQuery, [categoryId])
    ]);
    
    const totalPosts = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalPosts / limit);
    
    return {
      posts: posts.rows,
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages
      }
    };
  },

  // Get posts by user
  getByUser: async (userId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT p.*, u.name as author_name, 
        (SELECT json_agg(c.*) FROM categories c 
         JOIN post_categories pc ON c.id = pc.category_id 
         WHERE pc.post_id = p.id) as categories,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = 'SELECT COUNT(*) FROM posts WHERE user_id = $1';
    
    const [posts, countResult] = await Promise.all([
      db.query(query, [userId, limit, offset]),
      db.query(countQuery, [userId])
    ]);
    
    const totalPosts = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalPosts / limit);
    
    return {
      posts: posts.rows,
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages
      }
    };
  }
};

module.exports = Post;