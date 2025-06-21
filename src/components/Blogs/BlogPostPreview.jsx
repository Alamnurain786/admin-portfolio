// src/components/Blogs/BlogPostPreview.jsx
import React from 'react';

const BlogPostPreview = ({ post, imagePreview }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {post.headline}
        </h1>

        {imagePreview && (
          <div className="mb-6">
            <img
              src={imagePreview}
              alt={post.imageAlt || post.headline}
              className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {post.topics.map((topic) => (
            <span
              key={topic}
              // ADD break-words HERE
              className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm break-words"
            >
              {topic}
            </span>
          ))}
        </div>

        <div className="text-gray-600 dark:text-gray-300 italic mb-6 text-base sm:text-lg">
          {post.excerpt}
        </div>

        <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base lg:prose-lg">
          <div dangerouslySetInnerHTML={{ __html: post.articleBody }} />
        </div>
      </div>
    </div>
  );
};

export default BlogPostPreview;
