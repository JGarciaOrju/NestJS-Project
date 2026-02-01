import { ProjectRole } from '@prisma/client';

export class ProjectMemberResponse {
  id: string;
  userId: string;
  role: ProjectRole;
  joinedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export class ProjectResponseDto {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  members?: ProjectMemberResponse[];
  _count?: {
    tasks: number;
    members: number;
  };
}
