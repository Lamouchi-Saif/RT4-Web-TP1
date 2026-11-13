import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In } from 'typeorm';
import type { Repository } from 'typeorm';
import { CrudService } from '../common/services/crud.service.js';
import { SkillEntity } from './entities/skill.entity.js';
import type { CreateSkillDto } from './dto/create-skill.dto.js';
import type { UpdateSkillDto } from './dto/update-skill.dto.js';

@Injectable()
export class SkillService extends CrudService<SkillEntity> {
  constructor(
    @InjectRepository(SkillEntity) repository: Repository<SkillEntity>,
  ) {
    super(repository, 'Skill');
  }

  create(dto: CreateSkillDto) {
    return this.createEntity(dto);
  }

  update(id: number, dto: UpdateSkillDto) {
    return this.updateEntity(id, dto);
  }

  async findByIds(ids: number[]): Promise<SkillEntity[]> {
    if (ids.length === 0) return [];
    const skills = await this.repository.findBy({ id: In(ids) });
    const foundIds = new Set(skills.map((skill) => skill.id));
    const missingIds = ids.filter((id) => !foundIds.has(id));
    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Skills introuvables : ${missingIds.join(', ')}`,
      );
    }
    return skills;
  }
}
