import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import AuthorPage from './pages/AuthorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminPosts from './pages/admin/Posts';
import AdminCreatePost from './pages/admin/CreatePost';
import AdminEditPost from './pages/admin/EditPost';
import AdminCategories from './pages/admin/Categories';
import AdminComments from './pages/admin/Comments';
import AdminProfile from './pages/admin/Profile';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return <LoginPage />;
  }
  
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="post/:slug" element={<PostPage />} />
        <Route path="category/:id" element={<CategoryPage />} />
        <Route path="author/:id" element={<AuthorPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="posts" element={<AdminPosts />} />
        <Route path="posts/create" element={<AdminCreatePost />} />
        <Route path="posts/edit/:id" element={<AdminEditPost />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="comments" element={<AdminComments />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
    </Routes>
  );
}

export default App;