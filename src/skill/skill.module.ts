import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillEntity } from './entities/skill.entity.js';
import { SkillController } from './skill.controller.js';
import { SkillService } from './skill.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([SkillEntity])],
  controllers: [SkillController],
  providers: [SkillService],
  exports: [SkillService, TypeOrmModule],
})
export class SkillModule {}
