const db = require('../db');

const Category = {
  // Get all categories
  getAll: async () => {
    const query = `
      SELECT c.*, COUNT(pc.post_id) as post_count
      FROM categories c
      LEFT JOIN post_categories pc ON c.id = pc.category_id
      GROUP BY c.id
      ORDER BY c.name
    `;
    
    const result = await db.query(query);
    return result.rows;
  },

  // Get category by ID
  getById: async (id) => {
    const query = `
      SELECT c.*, COUNT(pc.post_id) as post_count
      FROM categories c
      LEFT JOIN post_categories pc ON c.id = pc.category_id
      WHERE c.id = $1
      GROUP BY c.id
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  // Create a new category
  create: async (name) => {
    const query = 'INSERT INTO categories (name) VALUES ($1) RETURNING *';
    const result = await db.query(query, [name]);
    return result.rows[0];
  },

  // Update category
  update: async (id, name) => {
    const query = 'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *';
    const result = await db.query(query, [name, id]);
    return result.rows[0];
  },

  // Delete category
  delete: async (id) => {
    const query = 'DELETE FROM categories WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
};

module.exports = Category;