import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    example: 'E-commerce Platform',
    description: 'Project name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Build a modern e-commerce platform with React and NestJS',
    description: 'Project description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
