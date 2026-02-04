import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../database/prisma.service';
import { Role } from '@prisma/client';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all active users', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@test.com',
          name: 'User 1',
          role: 'USER',
          isActive: true,
        },
        {
          id: '2',
          email: 'user2@test.com',
          name: 'User 2',
          role: 'USER',
          isActive: true,
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: '1',
        email: 'user@test.com',
        name: 'Test User',
        role: 'USER',
        isActive: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update user successfully when updating own profile', async () => {
      const existingUser = { id: '1', email: 'user@test.com', isActive: true };
      const updatedUser = {
        id: '1',
        email: 'user@test.com',
        name: 'Updated Name',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(
        '1',
        { name: 'Updated Name' },
        '1',
        Role.USER,
      );

      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', { name: 'Test' }, '1', Role.USER),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if USER tries to update another user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '2',
        email: 'other@test.com',
        isActive: true,
      });

      await expect(
        service.update('2', { name: 'Test' }, '1', Role.USER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow ADMIN to update any user', async () => {
      const existingUser = { id: '2', email: 'other@test.com', isActive: true };
      const updatedUser = { ...existingUser, name: 'Updated' };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(
        '2',
        { name: 'Updated' },
        '1',
        Role.ADMIN,
      );

      expect(result).toEqual(updatedUser);
    });

    it('should throw ConflictException if email already in use', async () => {
      // Primera llamada: buscar usuario por ID (existe)
      // Segunda llamada: buscar por nuevo email (ya existe otro usuario con ese email)
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce({
          id: '1',
          email: 'user@test.com',
          isActive: true,
        })
        .mockResolvedValueOnce({ id: '3', email: 'taken@test.com' });

      await expect(
        service.update('1', { email: 'taken@test.com' }, '1', Role.USER),
      ).rejects.toThrow(ConflictException);

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
      });

      mockPrismaService.user.update.mockResolvedValue({ isActive: false });

      const result = await service.remove('1');

      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
