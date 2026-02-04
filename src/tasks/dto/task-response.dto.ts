import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '@prisma/client';

class UserInfo {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;
}

class ProjectInfo {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'E-commerce Platform' })
  name: string;
}

export class TaskResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'Implement user authentication' })
  title: string;

  @ApiProperty({ example: 'Add JWT authentication', nullable: true })
  description: string | null;

  @ApiProperty({ example: 'TODO', enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty({ example: 'HIGH', enum: TaskPriority })
  priority: TaskPriority;

  @ApiProperty({ example: 'uuid-v4' })
  projectId: string;

  @ApiProperty({ example: 'uuid-v4', nullable: true })
  assigneeId: string | null;

  @ApiProperty({ example: 'uuid-v4', nullable: true })
  createdById: string | null;

  @ApiProperty({ example: '2026-02-15T00:00:00.000Z', nullable: true })
  dueDate: Date | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-01-31T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-31T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: ProjectInfo })
  project: ProjectInfo;

  @ApiProperty({ type: UserInfo, nullable: true, required: false })
  assignee?: UserInfo | null;

  @ApiProperty({ type: UserInfo, nullable: true, required: false })
  createdBy?: UserInfo | null;
}
