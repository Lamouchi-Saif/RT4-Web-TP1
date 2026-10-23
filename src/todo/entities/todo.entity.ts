import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TodoStatusEnum } from '../enums/todo-status.enum.js';
import { TimestampEntity } from '../../common/entities/timestamp.entity.js';


@Entity('todo')
// extends: inherits createdAt, updatedAt and deletedAt from TimestampEntity
export class TodoEntity extends TimestampEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: TodoStatusEnum,
    default: TodoStatusEnum.waiting,
  })
  status: TodoStatusEnum;
}