import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';

const CommentSection = ({ postId }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { isAuthenticated, currentUser } = useAuth();
  
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Fetch comments for the post
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/comments/post/${postId}`);
        setComments(response.data);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  // Submit a new comment
  const onSubmitComment = async (data) => {
    if (!isAuthenticated) {
      alert('You must be logged in to comment.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post('/api/comments', {
        post_id: postId,
        content: data.content
      });
      
      // Add the new comment to the list
      setComments([response.data, ...comments]);
      
      // Reset the form
      reset();
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await axios.delete(`/api/comments/${commentId}`);
        
        // Remove the deleted comment from the list
        setComments(comments.filter(comment => comment.id !== commentId));
      } catch (err) {
        console.error('Error deleting comment:', err);
        alert('Failed to delete comment. Please try again.');
      }
    }
  };

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
      const response = await axios.put(`/api/comments/${commentId}`, {
        content: editContent
      });
      
      // Update the comment in the list
      setComments(comments.map(comment => 
        comment.id === commentId ? response.data : comment
      ));
      
      // Exit edit mode
      setEditingCommentId(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating comment:', err);
      alert('Failed to update comment. Please try again.');
    }
  };

  // Check if user can edit/delete a comment
  const canModifyComment = (comment) => {
    if (!isAuthenticated || !currentUser) return false;
    
    // User can modify their own comments
    if (comment.user_id === currentUser.id) return true;
    
    // Admins can modify any comment
    if (currentUser.role === 'admin') return true;
    
    return false;
  };

  return (
    <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>

      {/* Comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit(onSubmitComment)} className="mb-8">
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add a comment
            </label>
            <textarea
              id="content"
              rows="4"
              className={`input ${errors.content ? 'border-red-300 dark:border-red-700' : ''}`}
              placeholder="Write your comment here..."
              {...register('content', { required: 'Comment content is required' })}
            ></textarea>
            {errors.content && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? 'Submitting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mb-8">
          <p className="text-gray-600 dark:text-gray-300">
            You must be logged in to comment.
          </p>
        </div>
      )}

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
      {loading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map(comment => (
            <div key={comment.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-2">
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
                
                {/* Comment actions */}
                {canModifyComment(comment) && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditComment(comment)}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              
              {/* Comment content */}
              {editingCommentId === comment.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="input mb-2"
                    rows="3"
                  ></textarea>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveEdit(comment.id)}
                      className="btn btn-primary text-sm py-1"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn btn-secondary text-sm py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {comment.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;