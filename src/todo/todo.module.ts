import { Module } from '@nestjs/common';
import { TodoController } from './todo.controller.js';
import { TodoService } from './todo.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoEntity } from './entities/todo.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([TodoEntity])],
  controllers: [TodoController],
  providers: [TodoService]
})
export class TodoModule {}
