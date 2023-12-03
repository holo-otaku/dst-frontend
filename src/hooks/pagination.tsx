import { useState, useCallback } from "react";

export interface PaginateProps {
  total: number;
  limit: number;
}

export type PageOrDots = number | "...";

export type PaginateReturn = [PaginateState & PaginateProps, PaginateActions];

export interface PaginateState {
  currentPage: number;
  availablePages: PageOrDots[];
}

export interface PaginateActions {
  next: () => void;
  previous: () => void;
  first: () => void;
  last: () => void;
  goto: (page: number) => void;
  changeTotal: (total: number) => void;
  setCurrentPage: (page: number) => void;
}

export const usePaginate = ({
  total = 0,
  limit = 10,
}: PaginateProps): PaginateReturn => {
  const [totalCount, setTotalCount] = useState(total);
  const [currentPage, setCurrentPage] = useState(1);
  const maxPages = Math.ceil(totalCount / limit);

  const next = useCallback(() => {
    setCurrentPage((prev) => (prev < maxPages ? prev + 1 : prev));
  }, [maxPages]);

  const previous = useCallback(() => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const first = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const last = useCallback(() => {
    setCurrentPage(maxPages);
  }, [maxPages]);

  const goto = useCallback(
    (page: number) => {
      if (page > 0 && page <= maxPages) setCurrentPage(page);
    },
    [maxPages]
  );

  const calculatePages = (): PageOrDots[] => {
    if (totalCount === 0) return [];

    const pages: PageOrDots[] = [currentPage];

    // Handle previous page numbers
    if (currentPage - 1 > 0) pages.unshift(currentPage - 1);
    if (currentPage - 2 > 0) pages.unshift(currentPage - 2);
    if (currentPage - 3 > 0) pages.unshift("...");
    if (pages[0] !== 1) pages.unshift(1);

    // Handle next page numbers
    if (currentPage + 1 <= maxPages) pages.push(currentPage + 1);
    if (currentPage + 2 <= maxPages) pages.push(currentPage + 2);
    if (currentPage + 3 <= maxPages) pages.push("...");
    if (!pages.includes(maxPages)) pages.push(maxPages);

    return pages;
  };

  return [
    { currentPage, availablePages: calculatePages(), limit, total: totalCount },
    {
      first,
      last,
      next,
      previous,
      goto,
      changeTotal: setTotalCount,
      setCurrentPage,
    },
  ];
};
