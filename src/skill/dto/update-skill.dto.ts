import { PartialType } from '@nestjs/mapped-types';
import { CreateSkillDto } from './create-skill.dto.js';

export class UpdateSkillDto extends PartialType(CreateSkillDto, {
  skipNullProperties: false,
}) {}
