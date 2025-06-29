# Personal Blog CMS

A modern and clean personal blog system built with React, Express, and PostgreSQL.

## Features

- **Frontend (React + Tailwind CSS)**
  - Homepage with recent blog posts
  - Blog post details page
  - Category filter and tag links
  - Search functionality
  - Responsive layout with dark/light mode toggle
  - Admin panel for content management

- **Backend (Express + PostgreSQL)**
  - User authentication (JWT)
  - CRUD operations for posts, categories, comments, and users
  - File/image upload for blog cover images
  - Input validation & sanitization
  - API route protection for admin endpoints

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```
3. Set up the PostgreSQL database:
   ```
   # Create a database named 'blog_cms'
   createdb blog_cms

   # Import the schema
   psql -d blog_cms -f server/db/schema.sql
   ```

4. Configure environment variables:
   - Copy the `.env.example` file to `.env` in the server directory
   - Update the values with your PostgreSQL credentials and JWT secret

5. Start the development servers:
   ```
   # Start the backend server
   cd server
   npm run dev

   # Start the frontend server (in a new terminal)
   cd ../client
   npm start
   ```

6. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Initial Setup

After starting the application, you'll need to create an admin user:

1. Register a new user through the API or directly in the database
2. Update the user's role to 'admin' in the database:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

## Project Structure

```
blog-cms/
├── client/           # React frontend
│   ├── public/       # Static files
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── contexts/   # React context providers
│   │   ├── layouts/    # Page layouts
│   │   ├── pages/      # Page components
│   │   │   └── admin/  # Admin panel pages
│   │   ├── App.js      # Main application component
│   │   └── index.js    # Entry point
├── server/           # Node.js backend
│   ├── controllers/  # Route controllers
│   ├── db/           # Database setup and schema
│   ├── middleware/   # Custom middleware
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── utils/        # Utility functions
│   └── index.js      # Server entry point
├── public/           # Uploaded files and static assets
│   └── uploads/      # User uploaded images
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Posts
- `GET /api/posts` - Get all posts (with pagination)
- `GET /api/posts/:id` - Get post by ID
- `GET /api/posts/slug/:slug` - Get post by slug
- `GET /api/posts/search` - Search posts
- `GET /api/posts/category/:categoryId` - Get posts by category
- `GET /api/posts/user/:userId` - Get posts by user
- `POST /api/posts` - Create a new post (admin only)
- `PUT /api/posts/:id` - Update a post (admin only)
- `DELETE /api/posts/:id` - Delete a post (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create a new category (admin only)
- `PUT /api/categories/:id` - Update a category (admin only)
- `DELETE /api/categories/:id` - Delete a category (admin only)

### Comments
- `GET /api/comments/post/:postId` - Get comments for a post
- `GET /api/comments/:id` - Get comment by ID
- `POST /api/comments` - Create a new comment
- `PUT /api/comments/:id` - Update a comment (comment author or admin)
- `DELETE /api/comments/:id` - Delete a comment (comment author, post author, or admin)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update a user (self or admin)
- `DELETE /api/users/:id` - Delete a user (self or admin)

## License

MIT# blog_cms
