import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillModule } from '../skill/skill.module.js';
import { UserModule } from '../user/user.module.js';
import { CvEntity } from './entities/cv.entity.js';
import { CvController } from './cv.controller.js';
import { CvService } from './cv.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([CvEntity]), UserModule, SkillModule],
  controllers: [CvController],
  providers: [CvService],
  exports: [CvService, TypeOrmModule],
})
export class CvModule {}
