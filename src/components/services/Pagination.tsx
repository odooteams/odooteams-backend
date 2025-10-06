
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage,
  totalPages,
  onPageChange 
}) => {
  return (
    <div className="flex justify-center mt-10">
      <nav className="inline-flex rounded-md shadow">
        <a 
          href="#" 
          className="py-2 px-4 bg-white border border-gray-300 rounded-l-md text-gray-700 hover:bg-gray-50"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage > 1) onPageChange(currentPage - 1);
          }}
        >
          &laquo;
        </a>
        
        {[...Array(totalPages)].map((_, index) => (
          <a 
            key={index}
            href="#" 
            className={`py-2 px-4 ${
              currentPage === index + 1 
                ? 'bg-odoo-purple text-white border border-odoo-purple' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(index + 1);
            }}
          >
            {index + 1}
          </a>
        ))}
        
        <a 
          href="#" 
          className="py-2 px-4 bg-white border border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-50"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage < totalPages) onPageChange(currentPage + 1);
          }}
        >
          &raquo;
        </a>
      </nav>
    </div>
  );
};

export default Pagination;
