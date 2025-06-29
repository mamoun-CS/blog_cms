import React from 'react';
import { Link } from 'react-router-dom';
import { Controller } from 'react-hook-form';

const PostForm = ({
  register,
  handleSubmit,
  control,
  errors,
  onSubmit,
  categories,
  coverImagePreview,
  handleCoverImageChange,
  loading,
  isEditing,
  post
}) => {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
        </label>
        <input
          id="title"
          type="text"
          className={`mt-1 block w-full rounded-md shadow-sm ${
            errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
          {...register('title', { required: 'Title is required' })}
          defaultValue={post?.title || ''}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
        )}
      </div>

      {/* Cover Image */}
      <div>
        <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Cover Image
        </label>
        <div className="mt-1 flex items-center">
          <input
            id="cover_image"
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
            className="sr-only"
          />
          <label
            htmlFor="cover_image"
            className="relative cursor-pointer bg-white dark:bg-gray-800 py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <span>{isEditing ? 'Change cover image' : 'Upload cover image'}</span>
          </label>
          {(coverImagePreview || post?.cover_image) && (
            <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
              Image selected
            </span>
          )}
        </div>
        {(coverImagePreview || post?.cover_image) && (
          <div className="mt-2">
            <img
              src={coverImagePreview || post?.cover_image}
              alt="Cover preview"
              className="h-48 w-full object-cover rounded-md"
            />
          </div>
        )}
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Categories
        </label>
        <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center">
              <input
                id={`category-${category.id}`}
                type="checkbox"
                value={category.id}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                {...register('categories')}
                defaultChecked={
                  post?.categories?.some(c => c.id === category.id) || false
                }
              />
              <label
                htmlFor={`category-${category.id}`}
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
        {errors.categories && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.categories.message}</p>
        )}
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Content
        </label>
        <div className="mt-1">
          <Controller
            name="content"
            control={control}
            defaultValue={post?.content || ''}
            rules={{ required: 'Content is required' }}
            render={({ field }) => (
              <textarea
                id="content"
                rows={15}
                className={`block w-full rounded-md shadow-sm ${
                  errors.content ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
                placeholder="Write your post content here... Markdown is supported."
                {...field}
              />
            )}
          />
        </div>
        {errors.content && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content.message}</p>
        )}
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          You can use Markdown syntax for formatting.
        </p>
      </div>

      {/* Form actions */}
      <div className="flex justify-end space-x-3">
        <Link
          to="/admin/posts"
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isEditing ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            <>{isEditing ? 'Save Changes' : 'Create Post'}</>
          )}
        </button>
      </div>
    </form>
  );
};

export default PostForm;