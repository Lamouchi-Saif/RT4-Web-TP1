import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { AddTodoDto } from './dto/add-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { TodoService } from './todo.service.js';

@Controller({ path: 'todo', version: '2' })
export class TodoDbController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  addTodo(@Body() dto: AddTodoDto) {
    return this.todoService.addTodo(dto);
  }

  @Patch(':id')
  updateTodo(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTodoDto) {
    return this.todoService.updateTodo(id, dto);
  }

  @Delete(':id')
  deleteTodo(@Param('id', ParseIntPipe) id: number) {
    return this.todoService.deleteTodo(id);
  }

  @Delete(':id/soft')
  softDeleteTodo(@Param('id', ParseIntPipe) id: number) {
    return this.todoService.softDeleteTodo(id);
  }

}
