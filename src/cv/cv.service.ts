import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { CrudService } from '../common/services/crud.service.js';
import { SkillService } from '../skill/skill.service.js';
import type { SkillEntity } from '../skill/entities/skill.entity.js';
import { UserService } from '../user/user.service.js';
import { CvEntity } from './entities/cv.entity.js';
import type { CreateCvDto } from './dto/create-cv.dto.js';
import type { UpdateCvDto } from './dto/update-cv.dto.js';

type CvWriteData = Omit<UpdateCvDto, 'skillIds'> & { skills?: SkillEntity[] };

@Injectable()
export class CvService extends CrudService<CvEntity> {
  constructor(
    @InjectRepository(CvEntity) repository: Repository<CvEntity>,
    @Inject(UserService) private readonly userService: UserService,
    @Inject(SkillService) private readonly skillService: SkillService,
  ) {
    super(repository, 'CV', ['skills']);
  }

  async create(dto: CreateCvDto) {
    return this.createEntity(await this.resolveRelations(dto));
  }

  async update(id: number, dto: UpdateCvDto) {
    const cv = await this.findOne(id);
    const { skills, ...attributes } = await this.resolveRelations(dto);
    this.repository.merge(cv, attributes);
    // merge() fusionne les tableaux : affecter explicitement pour les remplacer.
    if (skills !== undefined) cv.skills = skills;
    return this.repository.save(cv);
  }

  private async resolveRelations(
    dto: CreateCvDto | UpdateCvDto,
  ): Promise<CvWriteData> {
    const { userId, skillIds, ...attributes } = dto;
    const data: CvWriteData = { ...attributes };
    if (userId !== undefined) {
      // Vérifier l'existence sans inclure les informations du User dans la réponse.
      await this.userService.findOne(userId);
      data.userId = userId;
    }
    if (skillIds !== undefined) {
      data.skills = await this.skillService.findByIds(skillIds);
    }
    return data;
  }
}
