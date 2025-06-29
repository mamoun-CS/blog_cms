import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Components
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [pagination, setPagination] = useState({
    page: parseInt(queryParams.get('page') || '1'),
    limit: 10,
    totalPosts: 0,
    totalPages: 0
  });

  // Search for posts
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) {
        setPosts([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/posts/search?q=${searchQuery}&page=${pagination.page}&limit=${pagination.limit}`
        );
        setPosts(response.data.posts);
        setPagination(response.data.pagination);
      } catch (err) {
        console.error('Error searching posts:', err);
        setError('Failed to search posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery, pagination.page, pagination.limit]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    navigate(`/search?q=${encodeURIComponent(searchQuery)}&page=${newPage}`);
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Search Results
        </h1>
        
        {/* Search form */}
        <form onSubmit={handleSearch} className="max-w-2xl">
          <div className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for posts..."
              className="input rounded-r-none flex-grow"
            />
            <button
              type="submit"
              className="btn btn-primary rounded-l-none"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Search results */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
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
      ) : !searchQuery ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Enter a search term to find posts.</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No posts found matching "{searchQuery}".</p>
        </div>
      ) : (
        <div>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Found {pagination.totalPosts} {pagination.totalPosts === 1 ? 'result' : 'results'} for "{searchQuery}"
          </p>
          
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
        </div>
      )}
    </div>
  );
};

export default SearchPage;