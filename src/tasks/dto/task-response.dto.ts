import { TaskStatus, TaskPriority } from '@prisma/client';

export class TaskResponseDto {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId: string | null;
  createdById: string | null;
  dueDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  project: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
}
