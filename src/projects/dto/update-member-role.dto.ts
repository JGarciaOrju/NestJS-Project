import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectRole } from '@prisma/client';

export class UpdateMemberRoleDto {
  @ApiProperty({
    example: 'ADMIN',
    description: 'New role for the member',
    enum: ProjectRole,
  })
  @IsEnum(ProjectRole)
  @IsNotEmpty()
  role: ProjectRole;
}
