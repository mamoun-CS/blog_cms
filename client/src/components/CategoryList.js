import React from 'react';
import { Link } from 'react-router-dom';

const CategoryList = ({ categories }) => {
  return (
    <div className="space-y-2">
      {categories.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No categories found</p>
      ) : (
        <ul className="space-y-2">
          {categories.map(category => (
            <li key={category.id}>
              <Link
                to={`/category/${category.id}`}
                className="flex items-center justify-between group"
              >
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {category.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {category.post_count || 0}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoryList;