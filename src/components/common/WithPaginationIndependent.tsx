'use client';

import React from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import * as Icon from '@phosphor-icons/react/dist/ssr';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface WithPaginationProps<T> {
  query: UseQueryResult<T & { meta: PaginationMeta; }, Error>;
  currentPage: number;
  onPageChange: (page: number) => void;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: Error) => React.ReactNode;
  emptyComponent?: React.ReactNode;
}

export function WithPagination<T>({
  query,
  currentPage,
  onPageChange,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
}: WithPaginationProps<T>) {
  const { data, isLoading, isError, error } = query;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        {loadingComponent || (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="text-secondary">Loading...</p>
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        {errorComponent ? (
          errorComponent(error)
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <Icon.WarningCircle className="text-5xl text-red" />
            <p className="text-title font-semibold">Failed to load data</p>
            <p className="text-secondary">{error.message}</p>
            <button
              className="button-main mt-4"
              onClick={() => query.refetch()}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  // No data state
  if (!data || !data.meta) {
    return (
      <div className="flex items-center justify-center py-20">
        {emptyComponent || (
          <div className="flex flex-col items-center gap-3 text-center">
            <Icon.Package className="text-5xl text-secondary" />
            <p className="text-title font-semibold">No data found</p>
            <p className="text-secondary">There are no items to display</p>
          </div>
        )}
      </div>
    );
  }

  const { meta } = data;
  const hasData = meta.total > 0;

  // Empty data state (but query succeeded)
  if (!hasData) {
    return (
      <div className="flex items-center justify-center py-20">
        {emptyComponent || (
          <div className="flex flex-col items-center gap-3 text-center">
            <Icon.Package className="text-5xl text-secondary" />
            <p className="text-title font-semibold">No items found</p>
            <p className="text-secondary">There are no items to display</p>
          </div>
        )}
      </div>
    );
  }

  const totalPages = meta.totalPages || 1;
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Generate page numbers to display
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="w-full">
      {/* Render children with data */}
      <div className="mb-8">{children}</div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-line">
          {/* Page info */}
          <div className="text-secondary text-sm">
            Showing page <span className="font-semibold text-black">{currentPage}</span> of{' '}
            <span className="font-semibold text-black">{totalPages}</span>
            {' '}({meta.total} total items)
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-2">
            {/* Previous button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!canGoPrevious}
              className={`flex items-center justify-center w-10 h-10 rounded-lg border border-line transition-colors ${canGoPrevious
                ? 'hover:bg-black hover:text-white hover:border-black cursor-pointer'
                : 'opacity-40 cursor-not-allowed'
                }`}
              aria-label="Previous page"
            >
              <Icon.CaretLeft size={20} />
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 text-secondary">
                      ...
                    </span>
                  );
                }

                const pageNum = page as number;
                const isActive = pageNum === currentPage;

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`flex items-center justify-center min-w-10 h-10 px-3 rounded-lg border transition-colors ${isActive
                      ? 'bg-black text-white border-black font-semibold'
                      : 'border-line hover:bg-surface hover:border-secondary'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canGoNext}
              className={`flex items-center justify-center w-10 h-10 rounded-lg border border-line transition-colors ${canGoNext
                ? 'hover:bg-black hover:text-white hover:border-black cursor-pointer'
                : 'opacity-40 cursor-not-allowed'
                }`}
              aria-label="Next page"
            >
              <Icon.CaretRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
