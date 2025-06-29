import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

// Icons
import {
  DocumentTextIcon,
  FolderIcon,
  ChatBubbleLeftIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState({
    posts: 0,
    categories: 0,
    comments: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch posts count and recent posts
        const postsResponse = await axios.get('/api/posts?limit=5');
        setRecentPosts(postsResponse.data.posts);
        setStats(prev => ({ ...prev, posts: postsResponse.data.pagination.totalPosts }));
        
        // Fetch categories count
        const categoriesResponse = await axios.get('/api/categories');
        setStats(prev => ({ ...prev, categories: categoriesResponse.data.length }));
        
        // Fetch recent comments (assuming we have an endpoint for this)
        // For now, we'll just collect comments from the recent posts
        const commentsArray = [];
        let commentCount = 0;
        
        for (const post of postsResponse.data.posts) {
          if (commentsArray.length < 5) {
            const commentsResponse = await axios.get(`/api/comments/post/${post.id}`);
            commentCount += commentsResponse.data.length;
            
            // Add post title to each comment and add to array
            const commentsWithPostTitle = commentsResponse.data.map(comment => ({
              ...comment,
              post_title: post.title,
              post_slug: post.slug
            }));
            
            commentsArray.push(...commentsWithPostTitle);
          }
        }
        
        // Sort comments by date and take the 5 most recent
        const sortedComments = commentsArray
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        
        setRecentComments(sortedComments);
        setStats(prev => ({ ...prev, comments: commentCount }));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // If loading, show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
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
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Posts stat */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <DocumentTextIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Posts</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{stats.posts}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/posts" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                View all
              </Link>
            </div>
          </div>
        </div>

        {/* Categories stat */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <FolderIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Categories</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{stats.categories}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/categories" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                Manage categories
              </Link>
            </div>
          </div>
        </div>

        {/* Comments stat */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <ChatBubbleLeftIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Comments</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{stats.comments}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/comments" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                View all
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/admin/posts/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Post
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent posts */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Posts</h3>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentPosts.length === 0 ? (
              <li className="px-4 py-4 sm:px-6">
                <p className="text-gray-500 dark:text-gray-400">No posts yet.</p>
              </li>
            ) : (
              recentPosts.map(post => (
                <li key={post.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="truncate">
                      <Link
                        to={`/admin/posts/edit/${post.id}`}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 truncate"
                      >
                        {post.title}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <Link
                        to={`/post/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/admin/posts" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                View all posts
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent comments */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Comments</h3>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentComments.length === 0 ? (
              <li className="px-4 py-4 sm:px-6">
                <p className="text-gray-500 dark:text-gray-400">No comments yet.</p>
              </li>
            ) : (
              recentComments.map(comment => (
                <li key={comment.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div>
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {comment.user_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(comment.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                      {comment.content}
                    </p>
                    <div className="mt-1">
                      <Link
                        to={`/post/${comment.post_slug}`}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500"
                      >
                        on: {comment.post_title}
                      </Link>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/admin/comments" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                View all comments
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;