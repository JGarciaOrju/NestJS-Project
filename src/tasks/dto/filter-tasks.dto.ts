import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FilterTasksDto extends PaginationDto {
  @ApiProperty({
    example: 'TODO',
    description: 'Filter by status',
    enum: TaskStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({
    example: 'HIGH',
    description: 'Filter by priority',
    enum: TaskPriority,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({
    example: 'uuid-v4',
    description: 'Filter by assignee',
    required: false,
  })
  @IsOptional()
  @IsString()
  assigneeId?: string;

  @ApiProperty({
    example: 'uuid-v4',
    description: 'Filter by project',
    required: false,
  })
  @IsOptional()
  @IsString()
  projectId?: string;
}
