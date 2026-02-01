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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task in a project' })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a project member' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  create(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: any,
  ): Promise<TaskResponseDto> {
    return this.tasksService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks assigned to or created by user' })
  @ApiResponse({
    status: 200,
    description: 'List of tasks',
    type: [TaskResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@CurrentUser() user: any): Promise<TaskResponseDto[]> {
    return this.tasksService.findAll(user.id);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all tasks in a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'List of tasks in project',
    type: [TaskResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a project member' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findByProject(
    @Param('projectId') projectId: string,
    @CurrentUser() user: any,
  ): Promise<TaskResponseDto[]> {
    return this.tasksService.findByProject(projectId, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'Task found',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a project member' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<TaskResponseDto> {
    return this.tasksService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task (Assignee/Owner/Admin only)' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: any,
  ): Promise<TaskResponseDto> {
    return this.tasksService.update(id, dto, user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
    @CurrentUser() user: any,
  ): Promise<TaskResponseDto> {
    return this.tasksService.updateStatus(id, dto, user.id);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign task to user (Owner/Admin only)' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'Task assigned successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner/Admin only' })
  assignTask(
    @Param('id') id: string,
    @Body() dto: AssignTaskDto,
    @CurrentUser() user: any,
  ): Promise<TaskResponseDto> {
    return this.tasksService.assignTask(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task (Owner/Admin only)' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner/Admin only' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    return this.tasksService.remove(id, user.id);
  }
}
