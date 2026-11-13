import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { CvEntity } from '../../cv/entities/cv.entity.js';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'user',
  })
  role: string;

  @OneToMany(() => CvEntity, (cv) => cv.user)
  cvs: Relation<CvEntity[]>;
}
