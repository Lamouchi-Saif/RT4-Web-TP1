
import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { CrudService } from '../common/services/crud.service.js';
import { paginate } from '../common/utils/paginate.js';
import type { PaginationDto } from '../common/dto/pagination.dto.js';

import { SkillService } from '../skill/skill.service.js';
import type { SkillEntity } from '../skill/entities/skill.entity.js';

import { UserService } from '../user/user.service.js';

import { CvEntity } from './entities/cv.entity.js';
import type { CreateCvDto } from './dto/create-cv.dto.js';
import type { UpdateCvDto } from './dto/update-cv.dto.js';

import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface.js';

type CvWriteData = Omit<UpdateCvDto, 'skillIds'> & {
  userId: number;
  skills?: SkillEntity[];
};

@Injectable()
export class CvService extends CrudService<CvEntity> {

  constructor(
    @InjectRepository(CvEntity)
    repository: Repository<CvEntity>,

    @Inject(UserService)
    private readonly userService: UserService,

    @Inject(SkillService)
    private readonly skillService: SkillService,
  ) {
    super(repository, 'CV', ['skills']);
  }

  // CREATE: automatically assign the connected user
  async createForUser(dto: CreateCvDto, userId: number) {

    const { skillIds, ...attributes } = dto;

    const data: CvWriteData = {
      ...attributes,
      userId,
    };

    if (skillIds !== undefined) {
      data.skills = await this.skillService.findByIds(skillIds);
    }

    return this.createEntity(data);
  }

  // GET ALL: Admin gets everything, User gets their own CVs
  async findAllForUser(
    user: AuthenticatedUser,
    pagination: PaginationDto = {},
  ) {

    const query = this.repository
      .createQueryBuilder('entity')
      .leftJoinAndSelect('entity.skills', 'skills')
      .orderBy('entity.id', 'ASC');

    if (user.role !== 'admin') {
      query.where('entity.userId = :userId', {
        userId: user.userId,
      });
    }

    return paginate(query, pagination);
  }

  // GET ONE: Admin can see any CV, User only their own
  async findOneForUser(
    id: number,
    user: AuthenticatedUser,
  ) {

    const query = this.repository
      .createQueryBuilder('entity')
      .leftJoinAndSelect('entity.skills', 'skills')
      .where('entity.id = :id', { id });

    if (user.role !== 'admin') {
      query.andWhere('entity.userId = :userId', {
        userId: user.userId,
      });
    }

    const cv = await query.getOne();

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    return cv;
  }

  // UPDATE: only the owner can update
  async updateForUser(
    id: number,
    userId: number,
    dto: UpdateCvDto,
  ) {

    const cv = await this.repository.findOne({
      where: { id, userId },
      relations: {
        skills: true,
      },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    const { skillIds, ...attributes } = dto;

    this.repository.merge(cv, attributes);

    if (skillIds !== undefined) {
      cv.skills = await this.skillService.findByIds(skillIds);
    }

    return this.repository.save(cv);
  }

  // DELETE: only the owner can delete
  async removeForUser(id: number, userId: number): Promise<void> {

    const result = await this.repository.delete({
      id,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('CV not found');
    }
  }
}
