import { IsString, IsNotEmpty } from 'class-validator';

export class AssignTaskDto {
  @IsString()
  @IsNotEmpty()
  assigneeId: string;
}
