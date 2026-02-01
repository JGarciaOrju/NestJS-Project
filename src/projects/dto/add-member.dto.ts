import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ProjectRole } from '@prisma/client';

export class AddMemberDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(ProjectRole)
  @IsOptional()
  role?: ProjectRole;
}
