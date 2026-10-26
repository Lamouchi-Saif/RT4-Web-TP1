import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import type { PaginationDto } from '../dto/pagination.dto.js';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function paginate<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  { page = 1, limit = 10 }: PaginationDto = {},
): Promise<PaginatedResult<T>> {
  const [data, total] = await query
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
