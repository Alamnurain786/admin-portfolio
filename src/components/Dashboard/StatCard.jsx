//src/components/Dashboard/statCard.jsx
//use this component to display a statistic card in the dashboard
import React from 'react';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4">
    <div className="flex items-center">
      <div className={`${color} p-3 rounded-full text-white`}>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  </div>
);

export default StatCard;
