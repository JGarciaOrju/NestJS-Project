import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../database/prisma.service';
import { ProjectRole, TaskStatus, TaskPriority } from '@prisma/client';

describe('TasksService', () => {
  let service: TasksService;

  const mockPrismaService = {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      title: 'Test Task',
      description: 'A test task',
      projectId: 'project-1',
    };

    it('should create a task successfully', async () => {
      const mockProject = {
        id: 'project-1',
        isActive: true,
        members: [{ userId: 'user-1' }],
      };

      const mockTask = {
        id: 'task-1',
        title: createDto.title,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        project: { id: 'project-1', name: 'Test Project' },
        assignee: null,
        createdBy: { id: 'user-1', name: 'John', email: 'john@test.com' },
      };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.task.create.mockResolvedValue(mockTask);

      const result = await service.create(createDto, 'user-1');

      expect(result).toEqual(mockTask);
      expect(mockPrismaService.task.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not a project member', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue({
        id: 'project-1',
        isActive: true,
        members: [{ userId: 'other-user' }],
      });

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if assignee is not a project member', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue({
        id: 'project-1',
        isActive: true,
        members: [{ userId: 'user-1' }],
      });

      await expect(
        service.create({ ...createDto, assigneeId: 'non-member' }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return task if user is a project member', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        projectId: 'project-1',
        project: {
          id: 'project-1',
          name: 'Test Project',
        },
        assignee: null,
        createdBy: null,
      };

      const mockProject = {
        id: 'project-1',
        members: [{ userId: 'user-1' }],
      };

      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.findOne('task-1', 'user-1');

      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete task if user is owner', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue({
        id: 'task-1',
        isActive: true,
        project: {
          members: [{ userId: 'user-1', role: ProjectRole.OWNER }],
        },
      });

      mockPrismaService.task.update.mockResolvedValue({ isActive: false });

      const result = await service.remove('task-1', 'user-1');

      expect(result).toEqual({ message: 'Task deleted successfully' });
    });

    it('should throw ForbiddenException if user is only MEMBER', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue({
        id: 'task-1',
        isActive: true,
        project: {
          members: [{ userId: 'user-1', role: ProjectRole.MEMBER }],
        },
      });

      await expect(service.remove('task-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
