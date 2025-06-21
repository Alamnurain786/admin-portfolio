//src/components/Dashboard/recentComments.jsx
//use this component to display recent comments on blog posts
import React from 'react';

const RecentComments = ({ comments }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Comments
      </h2>

      {comments.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {comments.map((comment) => (
            <div key={comment._id} className="py-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm">
                    {comment.author.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {comment.author}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    On: {comment.postTitle}
                  </p>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </p>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No recent comments</p>
      )}
    </div>
  );
};

export default RecentComments;
