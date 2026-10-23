import { Body, Controller, Post, Version } from '@nestjs/common';
import { AddTodoDto } from './dto/add-todo.dto.js';
import { TodoService } from './todo.service.js';

@Controller('todo')
@Version('2')
export class TodoDbController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  addTodo(@Body() dto: AddTodoDto) {
    return this.todoService.addTodo(dto);
  }
}
