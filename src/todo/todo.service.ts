import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddTodoDto } from './dto/add-todo.dto.js';
import { TodoEntity } from './entities/todo.entity.js';
import { TodoStatusEnum } from './enums/todo-status.enum.js';

@Injectable()
export class TodoService {
  private readonly memoryTodos: Array<AddTodoDto & { id: number; status: TodoStatusEnum }> = [];

  constructor(
    @InjectRepository(TodoEntity)
    private readonly todoRepository: Repository<TodoEntity>,
  ) {}

  // Version 1: keep the created todo in this process's memory.
  addTodoMemory(dto: AddTodoDto) {
    const todo = {
      id: this.memoryTodos.length + 1,
      ...dto,
      status: TodoStatusEnum.waiting,
    };
    this.memoryTodos.push(todo);
    return todo;
  }

  // Version 2: save the todo row in MySQL through TypeORM.
  addTodo(dto: AddTodoDto): Promise<TodoEntity> {
    const todo = this.todoRepository.create({
      ...dto,
      status: TodoStatusEnum.waiting,
    });
    return this.todoRepository.save(todo);
  }
}
