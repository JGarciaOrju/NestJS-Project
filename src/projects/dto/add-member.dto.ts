import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectRole } from '@prisma/client';

export class AddMemberDto {
  @ApiProperty({
    example: 'uuid-v4',
    description: 'User ID to add as member',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: 'MEMBER',
    description: 'Role for the new member',
    enum: ProjectRole,
    required: false,
    default: 'MEMBER',
  })
  @IsEnum(ProjectRole)
  @IsOptional()
  role?: ProjectRole;
}
