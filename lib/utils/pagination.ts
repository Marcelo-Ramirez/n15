export interface PaginationParams {
  [key: string]: number | string | undefined
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit)
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  }
}

export function getPaginationOffset(page: number, limit: number): number {
  return (page - 1) * limit
}

export function sanitizePaginationParams(params: PaginationParams): Required<PaginationParams> {
  return {
    page: Math.max(1, params.page || 1),
    limit: Math.min(100, Math.max(1, params.limit || 10)),
    sortBy: params.sortBy || 'createdAt',
    sortOrder: params.sortOrder === 'asc' ? 'asc' : 'desc',
    search: params.search?.trim() || '',
  }
}
