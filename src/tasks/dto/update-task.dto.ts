import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '@prisma/client';

export class UpdateTaskDto {
  @ApiProperty({
    example: 'Updated task title',
    description: 'New task title',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'Updated task description',
    description: 'New task description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'IN_PROGRESS',
    description: 'New task status',
    enum: TaskStatus,
    required: false,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({
    example: 'URGENT',
    description: 'New task priority',
    enum: TaskPriority,
    required: false,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({
    example: 'uuid-v4',
    description: 'New assignee user ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({
    example: '2026-03-01T00:00:00.000Z',
    description: 'New due date',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
