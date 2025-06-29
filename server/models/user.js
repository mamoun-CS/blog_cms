const db = require('../db');
const bcrypt = require('bcrypt');

const User = {
  // Find user by email
  findByEmail: async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  },

  // Find user by ID
  findById: async (id) => {
    const query = 'SELECT id, name, email, role, created_at FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  // Create a new user
  create: async (userData) => {
    const { name, email, password, role = 'user' } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at
    `;
    
    const values = [name, email, hashedPassword, role];
    const result = await db.query(query, values);
    
    return result.rows[0];
  },

  // Update user
  update: async (id, userData) => {
    const { name, email, password, role } = userData;
    let query, values;
    
    // If password is being updated
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      query = `
        UPDATE users
        SET name = $1, email = $2, password = $3, role = $4
        WHERE id = $5
        RETURNING id, name, email, role, created_at
      `;
      
      values = [name, email, hashedPassword, role, id];
    } else {
      query = `
        UPDATE users
        SET name = $1, email = $2, role = $3
        WHERE id = $4
        RETURNING id, name, email, role, created_at
      `;
      
      values = [name, email, role, id];
    }
    
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Delete user
  delete: async (id) => {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  // Get all users
  getAll: async () => {
    const query = 'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC';
    const result = await db.query(query);
    return result.rows;
  }
};

module.exports = User;