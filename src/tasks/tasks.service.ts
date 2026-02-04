import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { TaskStatus, TaskPriority, ProjectRole } from '@prisma/client';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
/**
 * TasksService
 *
 * Handles task CRUD operations within projects.
 */
@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}
  /**
   * Get all tasks with filters and pagination.
   */
  async findAllWithFilters(
    userId: string,
    filters: FilterTasksDto,
  ): Promise<PaginatedResponseDto<TaskResponseDto>> {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      assigneeId,
      projectId,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
      OR: [{ assigneeId: userId }, { createdById: userId }],
    };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    // Get total count
    const total = await this.prisma.task.count({ where });

    // Get paginated tasks
    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: tasks,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
  /**
   * Create a new task in a project.
   * Only project members can create tasks.
   *
   * @throws NotFoundException if project not found
   * @throws ForbiddenException if user is not a member
   */
  async create(dto: CreateTaskDto, userId: string): Promise<TaskResponseDto> {
    // Verify project exists and user is a member
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId, isActive: true },
      include: {
        members: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isMember = project.members.some((m) => m.userId === userId);

    if (!isMember) {
      throw new ForbiddenException(
        'You must be a project member to create tasks',
      );
    }

    // If assigneeId provided, verify they are a project member
    if (dto.assigneeId) {
      const assigneeIsMember = project.members.some(
        (m) => m.userId === dto.assigneeId,
      );

      if (!assigneeIsMember) {
        throw new BadRequestException(
          'Assignee must be a member of the project',
        );
      }
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        projectId: dto.projectId,
        assigneeId: dto.assigneeId,
        createdById: userId,
        priority: dto.priority || TaskPriority.MEDIUM,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return task;
  }

  /**
   * Get all tasks assigned to the user or created by them.
   */
  async findAll(userId: string): Promise<TaskResponseDto[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        isActive: true,
        OR: [{ assigneeId: userId }, { createdById: userId }],
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tasks;
  }

  /**
   * Get all tasks in a specific project.
   * Only project members can view tasks.
   *
   * @throws NotFoundException if project not found
   * @throws ForbiddenException if user is not a member
   */
  async findByProject(
    projectId: string,
    userId: string,
  ): Promise<TaskResponseDto[]> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId, isActive: true },
      include: {
        members: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isMember = project.members.some((m) => m.userId === userId);

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this project');
    }

    const tasks = await this.prisma.task.findMany({
      where: {
        projectId: projectId,
        isActive: true,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tasks;
  }

  /**
   * Get a specific task by ID.
   * Only project members can view the task.
   *
   * @throws NotFoundException if task not found
   * @throws ForbiddenException if user is not a project member
   */
  async findOne(id: string, userId: string): Promise<TaskResponseDto> {
    const task = await this.prisma.task.findUnique({
      where: { id, isActive: true },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user is a project member - need separate query
    const project = await this.prisma.project.findUnique({
      where: { id: task.projectId },
      include: {
        members: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isMember = project.members.some((m) => m.userId === userId);

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this project');
    }

    return task;
  }

  /**
   * Update a task.
   * Task assignee or project owner/admin can update.
   *
   * @throws NotFoundException if task not found
   * @throws ForbiddenException if user doesn't have permission
   */
  async update(
    id: string,
    dto: UpdateTaskDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    const task = await this.prisma.task.findUnique({
      where: { id, isActive: true },
      include: {
        project: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user is a project member
    const member = task.project.members.find((m) => m.userId === userId);

    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }

    // Check permissions: assignee, owner, or admin can update
    const canUpdate =
      task.assigneeId === userId ||
      member.role === ProjectRole.OWNER ||
      member.role === ProjectRole.ADMIN;

    if (!canUpdate) {
      throw new ForbiddenException(
        'Only the assignee, project owner, or admin can update this task',
      );
    }

    // If changing assignee, verify they are a project member
    if (dto.assigneeId) {
      const assigneeIsMember = task.project.members.some(
        (m) => m.userId === dto.assigneeId,
      );

      if (!assigneeIsMember) {
        throw new BadRequestException(
          'Assignee must be a member of the project',
        );
      }
    }

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedTask;
  }

  /**
   * Update task status.
   * Task assignee or project owner/admin can update status.
   */
  async updateStatus(
    id: string,
    dto: UpdateTaskStatusDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    return this.update(id, { status: dto.status }, userId);
  }

  /**
   * Assign task to a user.
   * Only project owner/admin can assign tasks.
   *
   * @throws ForbiddenException if user doesn't have permission
   */
  async assignTask(
    id: string,
    dto: AssignTaskDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    const task = await this.prisma.task.findUnique({
      where: { id, isActive: true },
      include: {
        project: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const member = task.project.members.find((m) => m.userId === userId);

    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }

    if (
      member.role !== ProjectRole.OWNER &&
      member.role !== ProjectRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Only project owner or admin can assign tasks',
      );
    }

    // Verify assignee is a project member
    const assigneeIsMember = task.project.members.some(
      (m) => m.userId === dto.assigneeId,
    );

    if (!assigneeIsMember) {
      throw new BadRequestException('Assignee must be a member of the project');
    }

    return this.update(id, { assigneeId: dto.assigneeId }, userId);
  }

  /**
   * Soft delete a task.
   * Only project owner/admin can delete tasks.
   *
   * @throws NotFoundException if task not found
   * @throws ForbiddenException if user doesn't have permission
   */
  async remove(id: string, userId: string): Promise<{ message: string }> {
    const task = await this.prisma.task.findUnique({
      where: { id, isActive: true },
      include: {
        project: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const member = task.project.members.find((m) => m.userId === userId);

    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }

    if (
      member.role !== ProjectRole.OWNER &&
      member.role !== ProjectRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Only project owner or admin can delete tasks',
      );
    }

    await this.prisma.task.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Task deleted successfully' };
  }
}
