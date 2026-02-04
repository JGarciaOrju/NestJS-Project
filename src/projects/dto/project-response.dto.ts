import { ApiProperty } from '@nestjs/swagger';
import { ProjectRole } from '@prisma/client';

class UserInfo {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;
}

export class ProjectMemberResponse {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'uuid-v4' })
  userId: string;

  @ApiProperty({ example: 'OWNER', enum: ProjectRole })
  role: ProjectRole;

  @ApiProperty({ example: '2026-01-31T00:00:00.000Z' })
  joinedAt: Date;

  @ApiProperty({ type: UserInfo })
  user: UserInfo;
}

class ProjectCount {
  @ApiProperty({ example: 5 })
  tasks: number;

  @ApiProperty({ example: 3 })
  members: number;
}

export class ProjectResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'E-commerce Platform' })
  name: string;

  @ApiProperty({ example: 'Build a modern platform', nullable: true })
  description: string | null;

  @ApiProperty({ example: 'uuid-v4' })
  ownerId: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-01-31T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-31T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: UserInfo })
  owner: UserInfo;

  @ApiProperty({ type: [ProjectMemberResponse], required: false })
  members?: ProjectMemberResponse[];

  @ApiProperty({ type: ProjectCount, required: false })
  _count?: ProjectCount;
}
