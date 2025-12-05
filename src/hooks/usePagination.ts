import { useState, useMemo } from "react";

interface UsePaginationProps {
  initialPage?: number;
  initialPageSize?: number;
}

interface PaginationResult {
  page: number;
  pageSize: number;
  offset: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  reset: () => void;
}

export function usePagination({ initialPage = 1, initialPageSize = 10 }: UsePaginationProps = {}): PaginationResult {
  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

  const setPage = (newPage: number) => {
    setPageState(Math.max(1, newPage));
  };

  const setPageSize = (newPageSize: number) => {
    setPageSizeState(newPageSize);
    // Reset to first page when page size changes
    setPageState(1);
  };

  const reset = () => {
    setPageState(initialPage);
    setPageSizeState(initialPageSize);
  };

  return {
    page,
    pageSize,
    offset,
    setPage,
    setPageSize,
    reset,
  };
}

// Utility function to calculate pagination metadata
export function calculatePagination(totalItems: number, page: number, pageSize: number) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    totalPages,
    hasNextPage,
    hasPrevPage,
    startItem: (page - 1) * pageSize + 1,
    endItem: Math.min(page * pageSize, totalItems),
  };
}