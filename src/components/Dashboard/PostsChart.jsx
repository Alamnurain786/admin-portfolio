//src/components/dashboard/PostsChart.jsx
//use this component to display a bar chart of posts published over the last 6 months
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const PostsChart = ({ data }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow mb-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Posts Published (Last 6 Months)
      </h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3B82F6" name="Posts Published" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PostsChart;
