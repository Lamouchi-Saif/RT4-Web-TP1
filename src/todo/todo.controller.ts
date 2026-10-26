import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AddTodoDto } from './dto/add-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { TodoService } from './todo.service.js';
import { SearchTodoDto } from './dto/search-todo.dto.js';

@Controller({ path: 'todo', version: '1' })
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  // Version 1 keeps todos in memory; they disappear when the server restarts.
  @Post()
  add(@Body() dto: AddTodoDto) {
    return this.todoService.addTodoMemory(dto);
  }

  @Patch(':id')
  update(
    // ParseIntPipe converts the route parameter "5" (string) into 5 (number)
    // and answers 400 automatically if it is not a number
    @Param('id', ParseIntPipe) id: number,
    // The type annotation tells ValidationPipe which class to validate against
    @Body() dto: UpdateTodoDto,
  ) {
    return { id, ...dto };
  }

  @Delete(':id/soft')
  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.todoService.softDeleteTodo(id);
  }
  @Get()
  getAll(@Query() filters: SearchTodoDto) {
    return this.todoService.getAllTodos(filters);
  }
}
