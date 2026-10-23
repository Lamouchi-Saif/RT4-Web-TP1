import { Module } from '@nestjs/common';
import { TodoController } from './todo.controller.js';
import { TodoService } from './todo.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoEntity } from './entities/todo.entity.js';
import { TodoDbController } from './todo-db.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([TodoEntity])],
  controllers: [TodoController, TodoDbController],
  providers: [TodoService],
})
export class TodoModule {}
