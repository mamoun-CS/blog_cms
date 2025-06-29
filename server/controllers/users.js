const User = require('../models/user');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update user (admin can update any user, users can only update themselves)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user is updating their own profile or is an admin
    if (userId != req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }
    
    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { name, email, password, role } = req.body;
    
    // Only admins can change roles
    const updatedRole = req.user.role === 'admin' ? role : existingUser.role;
    
    const user = await User.update(userId, {
      name: name || existingUser.name,
      email: email || existingUser.email,
      password: password || undefined, // Only update password if provided
      role: updatedRole
    });
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    
    // Handle duplicate email
    if (err.code === '23505') { // PostgreSQL unique violation error code
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    res.status(500).send('Server error');
  }
};

// Delete user (admin can delete any user, users can only delete themselves)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user is deleting their own account or is an admin
    if (userId != req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this user' });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await User.delete(userId);
    res.json({ message: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};