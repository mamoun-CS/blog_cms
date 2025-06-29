import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

// Components
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import CategoryList from '../components/CategoryList';

const HomePage = () => {
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

  // Fetch posts with pagination
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/posts?page=${pagination.page}&limit=${pagination.limit}`);
        setPosts(response.data.posts);
        setPagination(response.data.pagination);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [pagination.page, pagination.limit]);

  // Fetch categories
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
  if (loading && posts.length === 0) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Featured Post (first post) */}
      {posts.length > 0 && (
        <div className="mb-12">
          <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <div className="lg:grid lg:grid-cols-2">
              <div className="lg:col-span-1">
                {posts[0].cover_image ? (
                  <img 
                    src={posts[0].cover_image} 
                    alt={posts[0].title} 
                    className="h-56 w-full object-cover lg:h-full"
                  />
                ) : (
                  <div className="h-56 w-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center lg:h-full">
                    <span className="text-gray-500 dark:text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <div className="p-8 lg:col-span-1">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <time dateTime={posts[0].created_at}>
                    {format(new Date(posts[0].created_at), 'MMMM d, yyyy')}
                  </time>
                  <span>•</span>
                  <span>{posts[0].author_name}</span>
                </div>
                <Link to={`/post/${posts[0].slug}`} className="block">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 hover:text-blue-600 dark:hover:text-blue-400">
                    {posts[0].title}
                  </h2>
                </Link>
                <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                  {posts[0].content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                </p>
                <div className="flex items-center">
                  <Link 
                    to={`/post/${posts[0].slug}`}
                    className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Read more
                    <span aria-hidden="true"> &rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Main content */}
        <div className="lg:col-span-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Latest Posts</h2>
          
          {/* Posts grid */}
          <div className="grid gap-8 md:grid-cols-2">
            {posts.slice(1).map(post => (
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
        </div>
        
        {/* Sidebar */}
        <div className="mt-12 lg:mt-0 lg:col-span-4">
          <div className="sticky top-20">
            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Categories</h3>
              <CategoryList categories={categories} />
            </div>
            
            {/* About */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">About</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Welcome to our blog! Here you'll find articles about technology, programming, and web development.
              </p>
              <Link 
                to="/login" 
                className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300"
              >
                Login to admin panel
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;