import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';

// Components
import PostForm from '../../components/admin/PostForm';

const CreatePost = () => {
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const navigate = useNavigate();

  // Fetch categories for the form
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      }
    };

    fetchCategories();
  }, []);

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
      setLoading(true);
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

      // Submit the post
      const response = await axios.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Redirect to the post edit page
      navigate(`/admin/posts/edit/${response.data.id}`);
    } catch (err) {
      console.error('Error creating post:', err);
      setError(
        err.response?.data?.message || 
        'Failed to create post. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Post</h1>
      
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
        loading={loading}
        isEditing={false}
      />
    </div>
  );
};

export default CreatePost;