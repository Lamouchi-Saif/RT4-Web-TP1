import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TodoStatusEnum } from '../enums/todo-status.enum.js';

@Entity('todo')
export class TodoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  name: string;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: TodoStatusEnum,
    default: TodoStatusEnum.waiting,
  })
  status: TodoStatusEnum;
}