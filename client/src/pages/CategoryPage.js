import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// Components
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import CategoryList from '../components/CategoryList';

const CategoryPage = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalPosts: 0,
    totalPages: 0
  });

  // Fetch category and its posts
  useEffect(() => {
    const fetchCategoryAndPosts = async () => {
      try {
        setLoading(true);
        
        // Fetch category details
        const categoryResponse = await axios.get(`/api/categories/${id}`);
        setCategory(categoryResponse.data);
        
        // Fetch posts for this category
        const postsResponse = await axios.get(
          `/api/posts/category/${id}?page=${pagination.page}&limit=${pagination.limit}`
        );
        setPosts(postsResponse.data.posts);
        setPagination(postsResponse.data.pagination);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Failed to load category. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndPosts();
  }, [id, pagination.page, pagination.limit]);

  // Fetch all categories for sidebar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  // If loading, show loading spinner
  if (loading && !category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
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
      </div>
    );
  }

  // If category not found
  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Category Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The category you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {category.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {pagination.totalPosts} {pagination.totalPosts === 1 ? 'post' : 'posts'} in this category
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Main content */}
        <div className="lg:col-span-8">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No posts found in this category.</p>
            </div>
          ) : (
            <>
              {/* Posts grid */}
              <div className="grid gap-8 md:grid-cols-2">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-12">
                  <Pagination 
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="mt-12 lg:mt-0 lg:col-span-4">
          <div className="sticky top-20">
            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Categories</h3>
              <CategoryList categories={categories} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;