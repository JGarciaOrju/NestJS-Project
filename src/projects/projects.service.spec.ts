import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../database/prisma.service';
import { ProjectRole } from '@prisma/client';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const mockPrismaService = {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    projectMember: {
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      name: 'Test Project',
      description: 'A test project',
    };

    it('should create a project and assign creator as owner', async () => {
      const mockProject = {
        id: 'project-1',
        name: createDto.name,
        description: createDto.description,
        ownerId: 'user-1',
        owner: { id: 'user-1', name: 'John', email: 'john@test.com' },
        members: [
          { id: 'member-1', userId: 'user-1', role: ProjectRole.OWNER },
        ],
        _count: { tasks: 0, members: 1 },
      };

      mockPrismaService.project.create.mockResolvedValue(mockProject);

      const result = await service.create(createDto, 'user-1');

      expect(result).toEqual(mockProject);
      expect(mockPrismaService.project.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: createDto.name,
            ownerId: 'user-1',
            members: {
              create: {
                userId: 'user-1',
                role: ProjectRole.OWNER,
              },
            },
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return project if user is a member', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test',
        members: [{ userId: 'user-1' }],
      };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.findOne('project-1', 'user-1');

      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not a member', async () => {
      const mockProject = {
        id: 'project-1',
        members: [{ userId: 'other-user' }],
      };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);

      await expect(service.findOne('project-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete project if user is owner', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue({
        id: 'project-1',
        ownerId: 'user-1',
        isActive: true,
      });

      mockPrismaService.project.update.mockResolvedValue({ isActive: false });

      const result = await service.remove('project-1', 'user-1');

      expect(result).toEqual({ message: 'Project deleted successfully' });
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue({
        id: 'project-1',
        ownerId: 'other-user',
        isActive: true,
      });

      await expect(service.remove('project-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('addMember', () => {
    it('should throw ConflictException if user is already a member', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue({
        id: 'project-1',
        isActive: true,
        members: [
          { userId: 'user-1', role: ProjectRole.OWNER },
          { userId: 'user-2', role: ProjectRole.MEMBER },
        ],
      });

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-2',
        isActive: true,
      });

      await expect(
        service.addMember('project-1', { userId: 'user-2' }, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ForbiddenException if requester is not owner/admin', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue({
        id: 'project-1',
        isActive: true,
        members: [{ userId: 'user-1', role: ProjectRole.MEMBER }],
      });

      await expect(
        service.addMember('project-1', { userId: 'user-3' }, 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeMember', () => {
    it('should throw BadRequestException when trying to remove owner', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue({
        id: 'project-1',
        isActive: true,
        members: [
          { id: 'mem-1', userId: 'user-1', role: ProjectRole.OWNER },
          { id: 'mem-2', userId: 'user-2', role: ProjectRole.MEMBER },
        ],
      });

      await expect(
        service.removeMember('project-1', 'user-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
