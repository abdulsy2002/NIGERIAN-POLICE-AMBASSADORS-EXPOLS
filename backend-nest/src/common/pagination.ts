import { BadRequestException } from '@nestjs/common';

export interface Pagination {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export function getPagination(page?: string, pageSize?: string): Pagination {
  const parsedPage = page === undefined ? 1 : Number(page);
  const parsedPageSize = pageSize === undefined ? 25 : Number(pageSize);
  if (!Number.isSafeInteger(parsedPage) || parsedPage < 1) {
    throw new BadRequestException('Page must be a positive integer');
  }
  if (!Number.isSafeInteger(parsedPageSize) || parsedPageSize < 1) {
    throw new BadRequestException('Page size must be a positive integer');
  }
  const size = Math.min(parsedPageSize, 100);
  if (parsedPage > 10_000) {
    throw new BadRequestException('Page cannot exceed 10000');
  }
  return { page: parsedPage, pageSize: size, skip: (parsedPage - 1) * size, take: size };
}

export function paginatedResult<T>(data: T[], total: number, pagination: Pagination) {
  return {
    data,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
      totalPages: Math.ceil(total / pagination.pageSize),
    },
  };
}
