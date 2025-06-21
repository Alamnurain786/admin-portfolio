import React from 'react';

const PostStatusBadge = ({ status }) => {
  // Define badge styles based on status
  const statusConfig = {
    public: {
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-800 dark:text-green-400',
      label: 'Published',
    },
    draft: {
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-800 dark:text-yellow-400',
      label: 'Draft',
    },
    archived: {
      bgColor: 'bg-gray-100 dark:bg-gray-700',
      textColor: 'text-gray-800 dark:text-gray-400',
      label: 'Archived',
    },
    scheduled: {
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-800 dark:text-blue-400',
      label: 'Scheduled',
    },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
    >
      {config.label}
    </span>
  );
};

export default PostStatusBadge;
