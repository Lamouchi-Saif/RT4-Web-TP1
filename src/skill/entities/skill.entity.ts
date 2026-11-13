import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { CvEntity } from '../../cv/entities/cv.entity.js';
import { TimestampEntity } from '../../common/entities/timestamp.entity.js';

@Entity('skill')
export class SkillEntity extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  designation: string;

  @ManyToMany(() => CvEntity, (cv) => cv.skills)
  cvs: Relation<CvEntity[]>;
}
