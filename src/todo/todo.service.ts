import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddTodoDto } from './dto/add-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { TodoEntity } from './entities/todo.entity.js';
import { TodoStatusEnum } from './enums/todo-status.enum.js';
import { SearchTodoDto } from './dto/search-todo.dto.js';

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

  async updateTodo(id: number, dto: UpdateTodoDto): Promise<TodoEntity> {
    const todo = await this.todoRepository.findOne({ where: { id } });
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    Object.assign(todo, dto);
    return this.todoRepository.save(todo);
  }

  async deleteTodo(id: number): Promise<void> {
    const result = await this.todoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Todo not found');
    }
  }

  async softDeleteTodo(id: number): Promise<void> {
    const result = await this.todoRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Todo not found');
    }
  }

  /**
   * Restores a todo that was previously soft-deleted.
   *
   * TypeORM updates the deleted record by clearing its `deletedAt` value,
   * making the todo visible to normal queries again. The operation does not
   * create a new todo or modify its other fields. If no todo matches the
   * supplied ID, an exception is thrown to indicate that it could not be restored.
   *
   * @param id The ID of the soft-deleted todo to restore.
   * @throws {NotFoundException} When no todo exists with the supplied ID.
   */
  async restoreTodo(id: number): Promise<void> {
    const result = await this.todoRepository.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException('Todo not found');
    }
  }

  async getStats(): Promise<Record<TodoStatusEnum, number>> {
    const rows = await this.todoRepository
      .createQueryBuilder('todo')
      .select('todo.status', 'status')
      .addSelect('COUNT(todo.id)', 'count')
      .groupBy('todo.status')
      .getRawMany<{ status: TodoStatusEnum; count: string }>();

    const stats: Record<TodoStatusEnum, number> = {
      [TodoStatusEnum.actif]: 0,
      [TodoStatusEnum.waiting]: 0,
      [TodoStatusEnum.done]: 0,
    };

    for (const row of rows) {
      stats[row.status] = Number(row.count);
    }

    return stats;
  }

  getAllTodos(filters: SearchTodoDto = {}): Promise<TodoEntity[]> {
    const query = this.todoRepository.createQueryBuilder('todo');

    if (filters.search) {
      query.andWhere(
        '(todo.name LIKE :search OR todo.description LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.status) {
      query.andWhere('todo.status = :status', { status: filters.status });
    }

    return query.getMany();
  }

  getTodoById(id: number): Promise<TodoEntity | null> {
    return this.todoRepository.findOneBy({ id });
  }
}
