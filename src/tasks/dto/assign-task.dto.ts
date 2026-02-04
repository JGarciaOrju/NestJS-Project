import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTaskDto {
  @ApiProperty({
    example: 'uuid-v4',
    description: 'User ID to assign the task to',
  })
  @IsString()
  @IsNotEmpty()
  assigneeId: string;
}
