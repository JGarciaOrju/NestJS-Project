import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectDto {
  @ApiProperty({
    example: 'Updated Project Name',
    description: 'New project name',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'Updated project description',
    description: 'New project description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
