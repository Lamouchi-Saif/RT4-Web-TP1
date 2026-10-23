import { Controller, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { AddTodoDto } from './dto/add-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';

@Controller('todo')
export class TodoController {
    // TEMPORARY: only to test validation. It will be replaced by the real addTodo.
    @Post()
    add(@Body() dto: AddTodoDto) {
    // If we reach this line, the DTO is valid
    return dto;
    }
    // TEMPORARY: only to test validation. It will be replaced by the real updateTodo.
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
}
