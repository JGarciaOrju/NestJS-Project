import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectRole } from '@prisma/client';

describe('ProjectsController', () => {
  let controller: ProjectsController;

  const mockProjectsService = {
    create: jest.fn(),
    findAllWithFilters: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
    updateMemberRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ---------------- CREATE ----------------

  describe('create', () => {
    it('should call create with correct params', async () => {
      const dto = { name: 'Test Project', description: 'Description' };
      const mockUser = { id: 'user-1' };
      const mockProject = { id: 'project-1', ...dto };

      mockProjectsService.create.mockResolvedValue(mockProject);

      const result = await controller.create(dto, mockUser);

      expect(mockProjectsService.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toEqual(mockProject);
    });
  });

  // ---------------- FIND ALL ----------------

  describe('findAll', () => {
    it('should call findAllWithFilters', async () => {
      const mockUser = { id: 'user-1' };
      const filters = { page: 1, limit: 10 };

      const mockResponse = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockProjectsService.findAllWithFilters.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser, filters);

      expect(mockProjectsService.findAllWithFilters).toHaveBeenCalledWith(
        'user-1',
        filters,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ---------------- FIND ONE ----------------

  describe('findOne', () => {
    it('should call findOne with correct params', async () => {
      const mockUser = { id: 'user-1' };
      const mockProject = { id: 'project-1', name: 'Test' };

      mockProjectsService.findOne.mockResolvedValue(mockProject);

      const result = await controller.findOne('project-1', mockUser);

      expect(mockProjectsService.findOne).toHaveBeenCalledWith(
        'project-1',
        'user-1',
      );
      expect(result).toEqual(mockProject);
    });
  });

  // ---------------- UPDATE ----------------

  describe('update', () => {
    it('should call update with correct params', async () => {
      const dto = { name: 'Updated Project' };
      const mockUser = { id: 'user-1' };
      const mockProject = { id: 'project-1', name: 'Updated Project' };

      mockProjectsService.update.mockResolvedValue(mockProject);

      const result = await controller.update('project-1', dto, mockUser);

      expect(mockProjectsService.update).toHaveBeenCalledWith(
        'project-1',
        dto,
        'user-1',
      );
      expect(result).toEqual(mockProject);
    });
  });

  // ---------------- REMOVE ----------------

  describe('remove', () => {
    it('should call remove with correct params', async () => {
      const mockUser = { id: 'user-1' };

      mockProjectsService.remove.mockResolvedValue({
        message: 'Project deleted successfully',
      });

      const result = await controller.remove('project-1', mockUser);

      expect(mockProjectsService.remove).toHaveBeenCalledWith(
        'project-1',
        'user-1',
      );
      expect(result).toEqual({
        message: 'Project deleted successfully',
      });
    });
  });

  // ---------------- ADD MEMBER ----------------

  describe('addMember', () => {
    it('should call addMember with correct params', async () => {
      const dto = {
        userId: 'user-2',
        role: ProjectRole.MEMBER,
      };
      const mockUser = { id: 'user-1' };
      const mockProject = { id: 'project-1' };

      mockProjectsService.addMember.mockResolvedValue(mockProject);

      const result = await controller.addMember('project-1', dto, mockUser);

      expect(mockProjectsService.addMember).toHaveBeenCalledWith(
        'project-1',
        dto,
        'user-1',
      );
      expect(result).toEqual(mockProject);
    });
  });

  // ---------------- REMOVE MEMBER ----------------

  describe('removeMember', () => {
    it('should call removeMember with correct params', async () => {
      const mockUser = { id: 'user-1' };
      const mockProject = { id: 'project-1' };

      mockProjectsService.removeMember.mockResolvedValue(mockProject);

      const result = await controller.removeMember(
        'project-1',
        'user-2',
        mockUser,
      );

      expect(mockProjectsService.removeMember).toHaveBeenCalledWith(
        'project-1',
        'user-2',
        'user-1',
      );
      expect(result).toEqual(mockProject);
    });
  });

  // ---------------- UPDATE MEMBER ROLE ----------------

  describe('updateMemberRole', () => {
    it('should call updateMemberRole with correct params', async () => {
      const dto = {
        role: ProjectRole.ADMIN,
      };
      const mockUser = { id: 'user-1' };
      const mockProject = { id: 'project-1' };

      mockProjectsService.updateMemberRole.mockResolvedValue(mockProject);

      const result = await controller.updateMemberRole(
        'project-1',
        'user-2',
        dto,
        mockUser,
      );

      expect(mockProjectsService.updateMemberRole).toHaveBeenCalledWith(
        'project-1',
        'user-2',
        dto,
        'user-1',
      );
      expect(result).toEqual(mockProject);
    });
  });
});
