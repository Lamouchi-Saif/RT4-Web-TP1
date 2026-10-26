import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TodoStatusEnum } from '../enums/todo-status.enum.js';
import { enumMessage } from '../../shared/error-messages.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

export class SearchTodoDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TodoStatusEnum, { message: enumMessage(TodoStatusEnum) })
  status?: TodoStatusEnum;
}
