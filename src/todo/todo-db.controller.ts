import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { AddTodoDto } from './dto/add-todo.dto.js';
import { SearchTodoDto } from './dto/search-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { TodoService } from './todo.service.js';
import type { AuthenticatedRequest } from './auth.middleware.js';
@Controller({ path: 'todo', version: '2' })
export class TodoDbController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
addTodo(
  @Body() dto: AddTodoDto,
  @Req() req: AuthenticatedRequest,
) {
  return this.todoService.addTodo(dto);
}

  @Patch(':id')
updateTodo(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateTodoDto,
  @Req() req: AuthenticatedRequest,
) {
  return this.todoService.updateTodo(id, dto);
}

 @Delete(':id')
deleteTodo(
  @Param('id', ParseIntPipe) id: number,
  @Req() req: AuthenticatedRequest,
) {
  return this.todoService.deleteTodo(id, req.userId);
}

  @Delete(':id/soft')
  softDeleteTodo(@Param('id', ParseIntPipe) id: number) {
    return this.todoService.softDeleteTodo(id);
  }

  @Patch('restore/:id')
  restoreTodo(@Param('id', ParseIntPipe) id: number) {
    return this.todoService.restoreTodo(id);
  }

  @Get('stats')
  getStats() {
    return this.todoService.getStats();
  }

  @Get(':id')
  async getTodoById(@Param('id', ParseIntPipe) id: number) {
    const todo = await this.todoService.getTodoById(id);
    if (!todo) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }
    return todo;
  }

  @Get()
  getAllTodos(@Query() filters: SearchTodoDto) {
    return this.todoService.getAllTodos(filters);
  }
}
