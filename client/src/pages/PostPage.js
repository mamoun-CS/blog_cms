import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Components
import CommentSection from '../components/CommentSection';

const PostPage = () => {
  const { slug } = useParams();
  const { isAuthenticated, isAdmin, currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch post by slug
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/posts/slug/${slug}`);
        setPost(response.data);
        
        // Fetch related posts from the same category
        if (response.data.categories && response.data.categories.length > 0) {
          const categoryId = response.data.categories[0].id;
          const relatedResponse = await axios.get(`/api/posts/category/${categoryId}?limit=3`);
          // Filter out the current post
          const filtered = relatedResponse.data.posts.filter(p => p.id !== response.data.id);
          setRelatedPosts(filtered.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // Handle delete post
  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/posts/${post.id}`);
        navigate('/');
      } catch (err) {
        console.error('Error deleting post:', err);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  // If loading, show loading spinner
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

  // If post not found
  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Post Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The post you're looking for doesn't exist or has been removed.
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
      <article className="max-w-4xl mx-auto">
        {/* Admin actions */}
        {isAuthenticated && isAdmin && (
          <div className="mb-6 flex justify-end space-x-4">
            <Link
              to={`/admin/posts/edit/${post.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit Post
            </Link>
            <button
              onClick={handleDeletePost}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Post
            </button>
          </div>
        )}

        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories.map(category => (
              <Link 
                key={category.id} 
                to={`/category/${category.id}`}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/30"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center text-gray-500 dark:text-gray-400 mb-8">
          <Link to={`/author/${post.user_id}`} className="font-medium hover:text-gray-700 dark:hover:text-gray-300">
            {post.author_name}
          </Link>
          <span className="mx-2">•</span>
          <time dateTime={post.created_at}>
            {format(new Date(post.created_at), 'MMMM d, yyyy')}
          </time>
        </div>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="mb-8">
            <img 
              src={post.cover_image} 
              alt={post.title} 
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
          <ReactMarkdown
            components={{
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Comments Section */}
        <CommentSection postId={post.id} />

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Posts</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {relatedPosts.map(relatedPost => (
                <div key={relatedPost.id} className="card">
                  {relatedPost.cover_image && (
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={relatedPost.cover_image} 
                        alt={relatedPost.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      <Link 
                        to={`/post/${relatedPost.slug}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                      {relatedPost.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default PostPage;