import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FilterProjectsDto extends PaginationDto {
  @ApiProperty({
    example: 'E-commerce',
    description: 'Search by project name',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
