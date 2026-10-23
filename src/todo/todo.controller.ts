import { Controller, Post, Body } from '@nestjs/common';
import { AddTodoDto } from './dto/add-todo.dto.js';

@Controller('todo')
export class TodoController {
    // TEMPORARY: only to test validation. It will be replaced by the real addTodo.
    @Post()
    add(@Body() dto: AddTodoDto) {
    // If we reach this line, the DTO is valid
    return dto;
    }
}
