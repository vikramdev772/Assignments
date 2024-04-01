// Pagination.jsx
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleClick = (page) => {
    onPageChange(page);
  };

  return (
    <div className="flex justify-center mt-4">
      <nav>
        <ul className="pagination flex">
          {pageNumbers.map((number) => (
            <li key={number} className="mx-[1px]">
              <button
                className={`px-5 py-3 ${
                  number === currentPage
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                } rounded-md hover:bg-gray-300`}
                onClick={() => handleClick(number)}
              >
                {number}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
