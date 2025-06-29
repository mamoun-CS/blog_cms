import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

// Icons
import {
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredComments, setFilteredComments] = useState([]);

  // Fetch all comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        
        // Fetch posts to get comments
        const postsResponse = await axios.get('/api/posts?limit=100');
        const posts = postsResponse.data.posts;
        
        // Collect all comments
        const allComments = [];
        
        for (const post of posts) {
          const commentsResponse = await axios.get(`/api/comments/post/${post.id}`);
          
          // Add post title and slug to each comment
          const commentsWithPostInfo = commentsResponse.data.map(comment => ({
            ...comment,
            post_title: post.title,
            post_slug: post.slug
          }));
          
          allComments.push(...commentsWithPostInfo);
        }
        
        // Sort comments by date (newest first)
        const sortedComments = allComments.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        
        setComments(sortedComments);
        setFilteredComments(sortedComments);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  // Filter comments when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredComments(comments);
      return;
    }
    
    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = comments.filter(comment => 
      comment.content.toLowerCase().includes(lowercasedSearch) ||
      comment.user_name.toLowerCase().includes(lowercasedSearch) ||
      comment.post_title.toLowerCase().includes(lowercasedSearch)
    );
    
    setFilteredComments(filtered);
  }, [searchTerm, comments]);

  // Start editing a comment
  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  // Save edited comment
  const handleSaveEdit = async (commentId) => {
    try {
      setSubmitting(true);
      
      const response = await axios.put(`/api/comments/${commentId}`, {
        content: editContent
      });
      
      // Update the comment in the list
      setComments(comments.map(comment => 
        comment.id === commentId ? { ...comment, content: response.data.content } : comment
      ));
      
      // Update filtered comments as well
      setFilteredComments(filteredComments.map(comment => 
        comment.id === commentId ? { ...comment, content: response.data.content } : comment
      ));
      
      // Exit edit mode
      setEditingCommentId(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating comment:', err);
      alert('Failed to update comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/comments/${commentId}`);
        
        // Remove the comment from the lists
        setComments(comments.filter(comment => comment.id !== commentId));
        setFilteredComments(filteredComments.filter(comment => comment.id !== commentId));
      } catch (err) {
        console.error('Error deleting comment:', err);
        alert('Failed to delete comment. Please try again.');
      }
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Comments</h1>
      
      {/* Search */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex w-full md:w-1/2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search comments..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Search
          </button>
        </form>
      </div>
      
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
      
      {/* Comments list */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No comments found matching your search.' : 'No comments found.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredComments.map(comment => (
              <li key={comment.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {comment.user_name?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {comment.user_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(comment.created_at), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditComment(comment)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <PencilIcon className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <TrashIcon className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Delete</span>
                    </button>
                  </div>
                </div>
                
                {/* Comment content */}
                {editingCommentId === comment.id ? (
                  <div className="mt-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="block w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      rows="3"
                    ></textarea>
                    <div className="mt-2 flex justify-end space-x-2">
                      <button
                        onClick={() => handleSaveEdit(comment.id)}
                        disabled={submitting || !editContent.trim()}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <XMarkIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {comment.content}
                    </p>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>On post: </span>
                      <Link
                        to={`/post/${comment.post_slug}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {comment.post_title}
                      </Link>
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

export default Comments;