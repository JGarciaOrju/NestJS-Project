import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Implement user authentication',
    description: 'Task title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Add JWT authentication to the API',
    description: 'Task description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'uuid-v4',
    description: 'Project ID where the task belongs',
  })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    example: 'uuid-v4',
    description: 'User ID to assign the task to',
    required: false,
  })
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({
    example: 'HIGH',
    description: 'Task priority',
    enum: TaskPriority,
    required: false,
    default: 'MEDIUM',
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({
    example: '2026-02-15T00:00:00.000Z',
    description: 'Task due date',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
