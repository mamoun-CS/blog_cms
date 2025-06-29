import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const PostCard = ({ post }) => {
  return (
    <article className="card h-full flex flex-col">
      {/* Post Image */}
      <div className="relative h-48 w-full overflow-hidden">
        {post.cover_image ? (
          <img 
            src={post.cover_image} 
            alt={post.title} 
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">No image</span>
          </div>
        )}
      </div>
      
      {/* Post Content */}
      <div className="flex-1 p-5 flex flex-col">
        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {post.categories.map(category => (
              <Link 
                key={category.id} 
                to={`/category/${category.id}`}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/30"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
        
        {/* Title */}
        <Link to={`/post/${post.slug}`} className="block">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400">
            {post.title}
          </h3>
        </Link>
        
        {/* Excerpt */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">
          {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
        </p>
        
        {/* Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto">
          <div className="flex items-center">
            <Link to={`/author/${post.user_id}`} className="hover:text-gray-700 dark:hover:text-gray-300">
              {post.author_name}
            </Link>
          </div>
          <time dateTime={post.created_at}>
            {format(new Date(post.created_at), 'MMM d, yyyy')}
          </time>
        </div>
        
        {/* Comments count */}
        {post.comment_count > 0 && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}
          </div>
        )}
      </div>
    </article>
  );
};

export default PostCard;