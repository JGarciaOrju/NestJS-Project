import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskStatus } from '@prisma/client';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';

describe('TasksController', () => {
  let controller: TasksController;

  const mockTasksService = {
    create: jest.fn(),
    findAllWithFilters: jest.fn(),
    findByProject: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    assignTask: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call create with correct params', async () => {
      const dto = new CreateTaskDto();
      dto.title = 'Test Task';
      dto.projectId = 'project-1';

      const mockUser = { id: 'user-1' };
      const mockTask = { id: 'task-1', ...dto };

      mockTasksService.create.mockResolvedValue(mockTask);

      const result = await controller.create(dto, mockUser);

      expect(mockTasksService.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should call findAllWithFilters with correct params', async () => {
      const mockUser = { id: 'user-1' };

      const filters = new FilterTasksDto();
      filters.page = 1;
      filters.limit = 10;
      filters.status = TaskStatus.TODO;

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

      mockTasksService.findAllWithFilters.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser, filters);

      expect(mockTasksService.findAllWithFilters).toHaveBeenCalledWith(
        'user-1',
        filters,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findByProject', () => {
    it('should call findByProject with correct params', async () => {
      const mockUser = { id: 'user-1' };
      const mockTasks = [{ id: 'task-1', title: 'Test Task' }];

      mockTasksService.findByProject.mockResolvedValue(mockTasks);

      const result = await controller.findByProject('project-1', mockUser);

      expect(mockTasksService.findByProject).toHaveBeenCalledWith(
        'project-1',
        'user-1',
      );
      expect(result).toEqual(mockTasks);
    });
  });

  describe('findOne', () => {
    it('should call findOne with correct params', async () => {
      const mockUser = { id: 'user-1' };
      const mockTask = { id: 'task-1', title: 'Test Task' };

      mockTasksService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne('task-1', mockUser);

      expect(mockTasksService.findOne).toHaveBeenCalledWith('task-1', 'user-1');
      expect(result).toEqual(mockTask);
    });
  });

  describe('update', () => {
    it('should call update with correct params', async () => {
      const dto = new UpdateTaskDto();
      dto.title = 'Updated Task';

      const mockUser = { id: 'user-1' };
      const mockTask = { id: 'task-1', title: 'Updated Task' };

      mockTasksService.update.mockResolvedValue(mockTask);

      const result = await controller.update('task-1', dto, mockUser);

      expect(mockTasksService.update).toHaveBeenCalledWith(
        'task-1',
        dto,
        'user-1',
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('updateStatus', () => {
    it('should call updateStatus with correct params', async () => {
      const dto = new UpdateTaskStatusDto();
      dto.status = TaskStatus.IN_PROGRESS;

      const mockUser = { id: 'user-1' };
      const mockTask = { id: 'task-1', status: TaskStatus.IN_PROGRESS };

      mockTasksService.updateStatus.mockResolvedValue(mockTask);

      const result = await controller.updateStatus('task-1', dto, mockUser);

      expect(mockTasksService.updateStatus).toHaveBeenCalledWith(
        'task-1',
        dto,
        'user-1',
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('assignTask', () => {
    it('should call assignTask with correct params', async () => {
      const dto = new AssignTaskDto();
      dto.assigneeId = 'user-2';

      const mockUser = { id: 'user-1' };
      const mockTask = { id: 'task-1', assigneeId: 'user-2' };

      mockTasksService.assignTask.mockResolvedValue(mockTask);

      const result = await controller.assignTask('task-1', dto, mockUser);

      expect(mockTasksService.assignTask).toHaveBeenCalledWith(
        'task-1',
        dto,
        'user-1',
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('remove', () => {
    it('should call remove with correct params', async () => {
      const mockUser = { id: 'user-1' };
      mockTasksService.remove.mockResolvedValue({
        message: 'Task deleted successfully',
      });

      const result = await controller.remove('task-1', mockUser);

      expect(mockTasksService.remove).toHaveBeenCalledWith('task-1', 'user-1');
      expect(result).toEqual({ message: 'Task deleted successfully' });
    });
  });
});
