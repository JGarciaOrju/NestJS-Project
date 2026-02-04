import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ example: 1, description: 'Current page' })
  page: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  limit: number;

  @ApiProperty({ example: 50, description: 'Total items' })
  total: number;

  @ApiProperty({ example: 5, description: 'Total pages' })
  totalPages: number;

  @ApiProperty({ example: true, description: 'Has next page' })
  hasNext: boolean;

  @ApiProperty({ example: false, description: 'Has previous page' })
  hasPrev: boolean;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of items' })
  data: T[];

  @ApiProperty({ type: PaginationMeta, description: 'Pagination metadata' })
  meta: PaginationMeta;
}
