import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';

// Icons
import {
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Categories = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editName, setEditName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Create a new category
  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await axios.post('/api/categories', {
        name: data.name
      });
      
      // Add the new category to the list
      setCategories([...categories, response.data]);
      
      // Reset the form
      reset();
    } catch (err) {
      console.error('Error creating category:', err);
      setError(
        err.response?.data?.message || 
        'Failed to create category. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Start editing a category
  const handleEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setEditName(category.name);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditName('');
  };

  // Save edited category
  const handleSaveEdit = async (categoryId) => {
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await axios.put(`/api/categories/${categoryId}`, {
        name: editName
      });
      
      // Update the category in the list
      setCategories(categories.map(category => 
        category.id === categoryId ? response.data : category
      ));
      
      // Exit edit mode
      setEditingCategoryId(null);
      setEditName('');
    } catch (err) {
      console.error('Error updating category:', err);
      setError(
        err.response?.data?.message || 
        'Failed to update category. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete a category
  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`/api/categories/${categoryId}`);
        
        // Remove the category from the list
        setCategories(categories.filter(category => category.id !== categoryId));
      } catch (err) {
        console.error('Error deleting category:', err);
        setError(
          err.response?.data?.message || 
          'Failed to delete category. Please try again.'
        );
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Categories</h1>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Create category form */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New Category</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="name" className="sr-only">Category Name</label>
              <input
                id="name"
                type="text"
                className={`block w-full rounded-md shadow-sm ${
                  errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
                placeholder="Enter category name"
                {...register('name', { required: 'Category name is required' })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Categories list */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">All Categories</h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No categories found. Create your first category above.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {categories.map(category => (
              <li key={category.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                {editingCategoryId === category.id ? (
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="block w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                    <button
                      onClick={() => handleSaveEdit(category.id)}
                      disabled={submitting || !editName.trim()}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</span>
                      {category.post_count !== undefined && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {category.post_count} {category.post_count === 1 ? 'post' : 'posts'}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <PencilIcon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Categories;