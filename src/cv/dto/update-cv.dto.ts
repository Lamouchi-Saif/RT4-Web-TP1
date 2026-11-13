import { PartialType } from '@nestjs/mapped-types';
import { CreateCvDto } from './create-cv.dto.js';

export class UpdateCvDto extends PartialType(CreateCvDto, {
  skipNullProperties: false,
}) {}
