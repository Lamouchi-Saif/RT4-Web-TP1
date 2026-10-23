import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TodoStatusEnum } from '../enums/todo-status.enum.js';
import { enumMessage } from '../../shared/error-messages.js';

export class SearchTodoDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TodoStatusEnum, { message: enumMessage(TodoStatusEnum) })
  status?: TodoStatusEnum;
}
