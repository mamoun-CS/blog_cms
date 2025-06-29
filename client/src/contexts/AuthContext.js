import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Set default headers for all axios requests
        axios.defaults.headers.common['x-auth-token'] = token;
        
        const response = await axios.get('/api/auth/me');
        setCurrentUser(response.data);
        setIsAuthenticated(true);
        setIsAdmin(response.data.role === 'admin');
      } catch (err) {
        console.error('Authentication error:', err);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set token in axios headers
      axios.defaults.headers.common['x-auth-token'] = token;
      
      // Get user data
      const userResponse = await axios.get('/api/auth/me');
      setCurrentUser(userResponse.data);
      setIsAuthenticated(true);
      setIsAdmin(userResponse.data.role === 'admin');
      
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials.'
      );
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  // Register a new user
  const register = async (name, email, password) => {
    setError(null);
    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password
      });
      
      const { token } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set token in axios headers
      axios.defaults.headers.common['x-auth-token'] = token;
      
      // Get user data
      const userResponse = await axios.get('/api/auth/me');
      setCurrentUser(userResponse.data);
      setIsAuthenticated(true);
      setIsAdmin(userResponse.data.role === 'admin');
      
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      );
      return false;
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setError(null);
    try {
      const response = await axios.put(`/api/users/${currentUser.id}`, userData);
      setCurrentUser(response.data);
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to update profile. Please try again.'
      );
      return false;
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    login,
    logout,
    register,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};