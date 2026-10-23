import { Module } from '@nestjs/common';
import { TodoController } from './todo.controller.js';
import { TodoService } from './todo.service.js';

@Module({
  controllers: [TodoController],
  providers: [TodoService]
})
export class TodoModule {}
