import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { ProjectRole } from '@prisma/client';
import { FilterProjectsDto } from './dto/filter-projects.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

/**
 * ProjectsService
 *
 * Handles project CRUD operations and member management.
 */
@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new project.
   * The creator becomes the owner automatically.
   */
  async create(
    dto: CreateProjectDto,
    userId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: ProjectRole.OWNER,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
    });

    return project;
  }

  /**
   * Get all projects where the user is a member.
   */
  async findAll(userId: string): Promise<ProjectResponseDto[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        isActive: true,
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return projects;
  }

  /**
   * Get a specific project by ID.
   *
   * @throws NotFoundException if project not found
   * @throws ForbiddenException if user is not a member
   */
  async findOne(id: string, userId: string): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id, isActive: true },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user is a member
    const isMember = project.members.some((member) => member.userId === userId);

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this project');
    }

    return project;
  }

  /**
   * Update a project.
   * Only owner or admin members can update.
   *
   * @throws NotFoundException if project not found
   * @throws ForbiddenException if user doesn't have permission
   */
  async update(
    id: string,
    dto: UpdateProjectDto,
    userId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id, isActive: true },
      include: {
        members: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user is owner or admin
    const member = project.members.find((m) => m.userId === userId);

    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }

    if (
      member.role !== ProjectRole.OWNER &&
      member.role !== ProjectRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Only project owner or admin can update the project',
      );
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: dto,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
    });

    return updatedProject;
  }

  /**
   * Soft delete a project.
   * Only the owner can delete the project.
   *
   * @throws NotFoundException if project not found
   * @throws ForbiddenException if user is not the owner
   */
  async remove(id: string, userId: string): Promise<{ message: string }> {
    const project = await this.prisma.project.findUnique({
      where: { id, isActive: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only the project owner can delete it');
    }

    await this.prisma.project.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Project deleted successfully' };
  }

  /**
   * Add a member to the project.
   * Only owner or admin can add members.
   *
   * @throws NotFoundException if project or user not found
   * @throws ForbiddenException if requester doesn't have permission
   * @throws ConflictException if user is already a member
   */
  async addMember(
    projectId: string,
    dto: AddMemberDto,
    requesterId: string,
  ): Promise<ProjectResponseDto> {
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId, isActive: true },
      include: {
        members: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if requester has permission
    const requesterMember = project.members.find(
      (m) => m.userId === requesterId,
    );

    if (!requesterMember) {
      throw new ForbiddenException('You are not a member of this project');
    }

    if (
      requesterMember.role !== ProjectRole.OWNER &&
      requesterMember.role !== ProjectRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Only project owner or admin can add members',
      );
    }

    // Check if user to add exists
    const userExists = await this.prisma.user.findUnique({
      where: { id: dto.userId, isActive: true },
    });

    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a member
    const isAlreadyMember = project.members.some(
      (m) => m.userId === dto.userId,
    );

    if (isAlreadyMember) {
      throw new ConflictException('User is already a member of this project');
    }

    // Add member
    await this.prisma.projectMember.create({
      data: {
        projectId: projectId,
        userId: dto.userId,
        role: dto.role || ProjectRole.MEMBER,
      },
    });

    // Return updated project
    return this.findOne(projectId, requesterId);
  }

  /**
   * Remove a member from the project.
   * Only owner or admin can remove members.
   * Owner cannot be removed.
   *
   * @throws NotFoundException if project or member not found
   * @throws ForbiddenException if requester doesn't have permission
   * @throws BadRequestException if trying to remove the owner
   */
  async removeMember(
    projectId: string,
    userId: string,
    requesterId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId, isActive: true },
      include: {
        members: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if requester has permission
    const requesterMember = project.members.find(
      (m) => m.userId === requesterId,
    );

    if (!requesterMember) {
      throw new ForbiddenException('You are not a member of this project');
    }

    if (
      requesterMember.role !== ProjectRole.OWNER &&
      requesterMember.role !== ProjectRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Only project owner or admin can remove members',
      );
    }

    // Check if member exists
    const memberToRemove = project.members.find((m) => m.userId === userId);

    if (!memberToRemove) {
      throw new NotFoundException('Member not found in this project');
    }

    // Cannot remove owner
    if (memberToRemove.role === ProjectRole.OWNER) {
      throw new BadRequestException('Cannot remove the project owner');
    }

    // Remove member
    await this.prisma.projectMember.delete({
      where: { id: memberToRemove.id },
    });

    return this.findOne(projectId, requesterId);
  }

  /**
   * Update a member's role in the project.
   * Only owner or admin can update roles.
   * Cannot change owner's role.
   *
   * @throws NotFoundException if project or member not found
   * @throws ForbiddenException if requester doesn't have permission
   * @throws BadRequestException if trying to change owner's role
   */
  async updateMemberRole(
    projectId: string,
    userId: string,
    dto: UpdateMemberRoleDto,
    requesterId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId, isActive: true },
      include: {
        members: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if requester has permission
    const requesterMember = project.members.find(
      (m) => m.userId === requesterId,
    );

    if (!requesterMember) {
      throw new ForbiddenException('You are not a member of this project');
    }

    if (
      requesterMember.role !== ProjectRole.OWNER &&
      requesterMember.role !== ProjectRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Only project owner or admin can update member roles',
      );
    }

    // Find member to update
    const memberToUpdate = project.members.find((m) => m.userId === userId);

    if (!memberToUpdate) {
      throw new NotFoundException('Member not found in this project');
    }

    // Cannot change owner's role
    if (memberToUpdate.role === ProjectRole.OWNER) {
      throw new BadRequestException("Cannot change the owner's role");
    }

    // Update role
    await this.prisma.projectMember.update({
      where: { id: memberToUpdate.id },
      data: { role: dto.role },
    });

    return this.findOne(projectId, requesterId);
  }

  /**
   * Get all projects with filters and pagination.
   */
  async findAllWithFilters(
    userId: string,
    filters: FilterProjectsDto,
  ): Promise<PaginatedResponseDto<ProjectResponseDto>> {
    const { page = 1, limit = 10, search } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
      members: {
        some: {
          userId: userId,
        },
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.project.count({ where });

    // Get paginated projects
    const projects = await this.prisma.project.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
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
      data: projects,
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
}
