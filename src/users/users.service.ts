import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * UsersService
 *
 * Handles user CRUD operations with proper authorization checks.
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all active users (Admin only).
   */
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  /**
   * Get user by ID.
   *
   * @throws NotFoundException if user not found.
   */
  async findOne(id: string): Promise<UserResponseDto> {
    console.log('🔍 Searching for user with ID:', id);
    console.log('🔍 ID type:', typeof id);
    console.log('🔍 ID length:', id.length);

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('📦 User found:', user);

    if (!user) {
      console.log('❌ User not found in database');
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      console.log('❌ User is not active');
      throw new NotFoundException('User is not active');
    }

    return user;
  }
  /**
   * Update user information.
   *
   * Users can onlye update themselves unless they are ADMIN.
   *
   * @throws NotFoundException if user not found.
   * @throws ConflictException if email already exists.
   * @throws ForbiddenException if trying to update another user without admin rights.
   */
  async update(
    id: string,
    dto: UpdateUserDto,
    currentUserId: string,
    currentUserRole: Role,
  ): Promise<UserResponseDto> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Authorization: Users can only update themselves, admins can update anyone.
    if (currentUserId !== id && currentUserRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only update your own information');
    }

    // Hash password if being updated
    const updatedData: any = { ...dto };
    if (dto.password) {
      updatedData.password = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updatedData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Soft delete a user (Admin only).
   *
   * @throws NotFoundException if user not found.
   */
  async remove(id: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'User deleted successfully' };
  }
}
