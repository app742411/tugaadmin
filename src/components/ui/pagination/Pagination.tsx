import React from "react";
import Select from "../select/Select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  isLoading = false,
}) => {
  if (totalPages <= 0) return null;

  // Calculate shown range
  const startEntry = Math.min((currentPage - 1) * limit + 1, totalItems);
  const endEntry = Math.min(currentPage * limit, totalItems);

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first, last, current, and adjacent pages
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-b-2xl">
      {/* Information Section */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing{" "}
        <span className="font-semibold text-gray-800 dark:text-white">
          {totalItems === 0 ? 0 : startEntry}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-gray-800 dark:text-white">
          {endEntry}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-800 dark:text-white">
          {totalItems}
        </span>{" "}
        entries
      </div>

      {/* Pages Navigation */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="flex items-center justify-center px-3 h-9 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] text-sm font-medium transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`dots-${index}`}
                    className="flex w-9 h-9 items-center justify-center text-gray-400 text-sm font-medium"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = page as number;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  disabled={isLoading}
                  className={`flex w-9 h-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                    currentPage === pageNum
                      ? "bg-brand-500 text-white shadow-theme-xs"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="flex items-center justify-center px-3 h-9 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] text-sm font-medium transition-colors"
          >
            Next
          </button>
        </div>

        {onLimitChange && (
          <div className="flex items-center gap-1.5 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 pt-2 md:pt-0 md:pl-4">
            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">Show</span>
            <Select
              options={[
                { value: 10, label: "10" },
                { value: 20, label: "20" },
                { value: 50, label: "50" },
                { value: 100, label: "100" },
              ]}
              value={limit}
              onChange={(val) => onLimitChange(Number(val))}
              disabled={isLoading}
              className="w-24"
              dropdownPosition="top"
            />
            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">entries</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
