import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { TimestampEntity } from '../../common/entities/timestamp.entity.js';
import { UserEntity } from '../../user/entities/user.entity.js';
import { SkillEntity } from '../../skill/entities/skill.entity.js';

@Entity('cv')
export class CvEntity extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  firstname: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'varchar', length: 32 })
  cin: string;

  @Column({ type: 'varchar', length: 150 })
  job: string;

  @Column({ type: 'varchar', length: 255 })
  path: string;

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => UserEntity, (user) => user.cvs, { nullable: false })
  user: Relation<UserEntity>;

  @ManyToMany(() => SkillEntity, (skill) => skill.cvs)
  @JoinTable({ name: 'cv_skills' })
  skills: Relation<SkillEntity[]>;
}
