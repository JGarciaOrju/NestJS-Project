import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProjectRole } from '@prisma/client';

export class UpdateMemberRoleDto {
  @IsEnum(ProjectRole)
  @IsNotEmpty()
  role: ProjectRole;
}
