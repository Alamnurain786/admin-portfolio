//src/components/ui/pagination.jsx
//use this component to create a pagination component for navigating through pages of data
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const pageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    // If total pages is less than max to show, display all pages
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always include first page, last page, and pages around current page
    pages.push(1);

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    if (startPage > 2) {
      pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <nav className="flex items-center justify-between">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <ul className="flex items-center -space-x-px h-8">
            <li>
              <button
                onClick={handlePrevClick}
                disabled={currentPage === 1}
                className={`ml-0 block px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md ${
                  currentPage === 1
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="sr-only">Previous</span>
                &laquo;
              </button>
            </li>

            {pageNumbers().map((page, index) => (
              <li key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 border border-gray-300 dark:border-gray-600 ${
                      currentPage === page
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-500 dark:border-blue-500 z-10'
                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </li>
            ))}

            <li>
              <button
                onClick={handleNextClick}
                disabled={currentPage === totalPages}
                className={`block px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="sr-only">Next</span>
                &raquo;
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile pagination (simplified) */}
      <div className="flex justify-between sm:hidden">
        <button
          onClick={handlePrevClick}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
            currentPage === 1
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          Previous
        </button>
        <button
          onClick={handleNextClick}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-4 py-2 ml-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
            currentPage === totalPages
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          Next
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
