import { NotFoundException } from '@nestjs/common';
import type { DeepPartial, Repository } from 'typeorm';
import type { PaginationDto } from '../dto/pagination.dto.js';
import { paginate } from '../utils/paginate.js';

/** Opérations communes ; les services métier complètent la gestion des relations. */
export abstract class CrudService<T extends { id: number }> {
  protected constructor(
    protected readonly repository: Repository<T>,
    private readonly resourceName: string,
    private readonly relations: string[] = [],
  ) {}

  findAll(pagination: PaginationDto = {}) {
    return paginate(this.createQuery().orderBy('entity.id', 'ASC'), pagination);
  }

  private createQuery() {
    const query = this.repository.createQueryBuilder('entity');
    for (const relation of this.relations) {
      query.leftJoinAndSelect(`entity.${relation}`, relation);
    }
    return query;
  }

  async findOne(id: number): Promise<T> {
    const entity = await this.createQuery()
      .where('entity.id = :id', { id })
      .getOne();
    if (!entity) {
      throw new NotFoundException(`${this.resourceName} ${id} introuvable`);
    }
    return entity;
  }

  protected createEntity(data: DeepPartial<T>): Promise<T> {
    return this.repository.save(this.repository.create(data));
  }

  protected async updateEntity(id: number, data: DeepPartial<T>): Promise<T> {
    const entity = await this.findOne(id);
    return this.repository.save(this.repository.merge(entity, data));
  }

  async remove(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`${this.resourceName} ${id} introuvable`);
    }
  }
}
