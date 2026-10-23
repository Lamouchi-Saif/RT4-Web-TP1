import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { AddTodoDto } from './add-todo.dto.js';
import { TodoStatusEnum } from '../enums/todo-status.enum.js';
import { enumMessage } from '../../shared/error-messages.js';

// PartialType(AddTodoDto) builds a class with the fields of AddTodoDto
// (name, description), all OPTIONAL, keeping their validation rules
// (size constraints, custom messages). Nothing is duplicated.
export class UpdateTodoDto extends PartialType(AddTodoDto) {
  // The status is not in AddTodoDto (a new todo is always "En attente"),
  // but an update can change it.
  // @IsOptional: if the field is absent, skip its validators.
  // @IsEnum: if present, it must be one of the enum VALUES.
  @IsOptional()
  @IsEnum(TodoStatusEnum, { message: enumMessage(TodoStatusEnum) })
  status?: TodoStatusEnum;
}