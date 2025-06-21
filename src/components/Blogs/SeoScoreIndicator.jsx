import React from 'react';

const SeoScoreIndicator = ({ score }) => {
  const getScoreColor = () => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <span className={`ml-2 text-sm font-bold ${getScoreColor()}`}>
      Score: {score}/100
    </span>
  );
};

export default SeoScoreIndicator;
