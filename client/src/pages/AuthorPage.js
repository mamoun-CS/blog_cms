import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

// Components
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';

const AuthorPage = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalPosts: 0,
    totalPages: 0
  });

  // Fetch author and their posts
  useEffect(() => {
    const fetchAuthorAndPosts = async () => {
      try {
        setLoading(true);
        
        // Fetch author details
        const authorResponse = await axios.get(`/api/users/${id}`);
        setAuthor(authorResponse.data);
        
        // Fetch posts by this author
        const postsResponse = await axios.get(
          `/api/posts/user/${id}?page=${pagination.page}&limit=${pagination.limit}`
        );
        setPosts(postsResponse.data.posts);
        setPagination(postsResponse.data.pagination);
      } catch (err) {
        console.error('Error fetching author data:', err);
        setError('Failed to load author. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorAndPosts();
  }, [id, pagination.page, pagination.limit]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  // If loading, show loading spinner
  if (loading && !author) {
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

  // If author not found
  if (!author) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Author Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The author you're looking for doesn't exist or has been removed.
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
      {/* Author profile */}
      <div className="mb-12">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
            {author.name.charAt(0)}
          </div>
          <div className="ml-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {author.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Member since {format(new Date(author.created_at), 'MMMM yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Author's posts */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Posts by {author.name}
        </h2>
        
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">This author hasn't published any posts yet.</p>
          </div>
        ) : (
          <>
            {/* Posts grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
};

export default AuthorPage;