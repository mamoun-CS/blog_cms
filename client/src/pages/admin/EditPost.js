import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';

// Components
import PostForm from '../../components/admin/PostForm';

const EditPost = () => {
  const { id } = useParams();
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm();
  const [post, setPost] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const navigate = useNavigate();

  // Fetch post and categories
  useEffect(() => {
    const fetchPostAndCategories = async () => {
      try {
        setLoading(true);
        
        // Fetch post
        const postResponse = await axios.get(`/api/posts/${id}`);
        setPost(postResponse.data);
        
        // Fetch categories
        const categoriesResponse = await axios.get('/api/categories');
        setCategories(categoriesResponse.data);
        
        // Reset form with post data
        reset({
          title: postResponse.data.title,
          content: postResponse.data.content,
          categories: postResponse.data.categories?.map(c => c.id.toString()) || []
        });
      } catch (err) {
        console.error('Error fetching post data:', err);
        setError('Failed to load post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndCategories();
  }, [id, reset]);

  // Handle cover image change
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setCoverImageFile(null);
      setCoverImagePreview(null);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setSaving(true);
      setError(null);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      
      // Add selected categories
      if (data.categories && data.categories.length > 0) {
        data.categories.forEach(categoryId => {
          formData.append('categories[]', categoryId);
        });
      }
      
      // Add cover image if selected
      if (coverImageFile) {
        formData.append('cover_image', coverImageFile);
      }

      // Update the post
      await axios.put(`/api/posts/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Redirect to posts list
      navigate('/admin/posts');
    } catch (err) {
      console.error('Error updating post:', err);
      setError(
        err.response?.data?.message || 
        'Failed to update post. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // If loading, show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If post not found
  if (!post && !loading) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700 dark:text-red-200">Post not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Post</h1>
      
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
      
      <PostForm 
        register={register}
        handleSubmit={handleSubmit}
        control={control}
        errors={errors}
        onSubmit={onSubmit}
        categories={categories}
        coverImagePreview={coverImagePreview}
        handleCoverImageChange={handleCoverImageChange}
        loading={saving}
        isEditing={true}
        post={post}
      />
    </div>
  );
};

export default EditPost;