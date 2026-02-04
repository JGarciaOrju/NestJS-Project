import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Query } from '@nestjs/common';
import { FilterProjectsDto } from './dto/filter-projects.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: any,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all projects with filters and pagination',
    description: 'Get projects where user is a member with optional search',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of projects',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @CurrentUser() user: any,
    @Query() filters: FilterProjectsDto,
  ): Promise<PaginatedResponseDto<ProjectResponseDto>> {
    return this.projectsService.findAllWithFilters(user.id, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Project found',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a member' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project (Owner/Admin only)' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner/Admin only' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: any,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project (Owner only)' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner only' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    return this.projectsService.remove(id, user.id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to project (Owner/Admin only)' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Member added successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner/Admin only' })
  @ApiResponse({ status: 409, description: 'User already a member' })
  addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
    @CurrentUser() user: any,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.addMember(id, dto, user.id);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove member from project (Owner/Admin only)' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiParam({ name: 'userId', description: 'User ID to remove' })
  @ApiResponse({
    status: 200,
    description: 'Member removed successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner/Admin only' })
  @ApiResponse({ status: 400, description: 'Cannot remove owner' })
  removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: any,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.removeMember(id, userId, user.id);
  }

  @Patch(':id/members/:userId/role')
  @ApiOperation({ summary: 'Update member role (Owner/Admin only)' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner/Admin only' })
  @ApiResponse({ status: 400, description: "Cannot change owner's role" })
  updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser() user: any,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.updateMemberRole(id, userId, dto, user.id);
  }
}
