import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call findAll', async () => {
      const mockUsers = [{ id: '1', email: 'test@test.com' }];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getProfile', () => {
    it('should call findOne with current user id', async () => {
      const mockUser = { id: '1', email: 'test@test.com' };
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.getProfile({ id: '1' });

      expect(mockUsersService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOne', () => {
    it('should call findOne with given id', async () => {
      const mockUser = { id: '1', email: 'test@test.com' };
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('1');

      expect(mockUsersService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should call update with correct params', async () => {
      const dto = { name: 'Updated' };
      const mockUser = { id: '1', role: Role.USER };
      const mockUpdatedUser = { id: '1', name: 'Updated' };

      mockUsersService.update.mockResolvedValue(mockUpdatedUser);

      const result = await controller.update('1', dto, mockUser);

      expect(mockUsersService.update).toHaveBeenCalledWith(
        '1',
        dto,
        '1',
        Role.USER,
      );
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('remove', () => {
    it('should call remove with correct id', async () => {
      mockUsersService.remove.mockResolvedValue({
        message: 'User deleted successfully',
      });

      const result = await controller.remove('1');

      expect(mockUsersService.remove).toHaveBeenCalledWith('1');
      expect(result).toEqual({ message: 'User deleted successfully' });
    });
  });
});
