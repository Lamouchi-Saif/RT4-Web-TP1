
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

import {
  lengthMessage,
  requiredMessage,
} from '../../shared/error-messages.js';

export class CreateCvDto {

  @IsString()
  @IsNotEmpty({ message: requiredMessage })
  @MaxLength(100, { message: lengthMessage('max') })
  name: string;

  @IsString()
  @IsNotEmpty({ message: requiredMessage })
  @MaxLength(100, { message: lengthMessage('max') })
  firstname: string;

  @IsInt()
  @Min(1)
  @Max(150)
  age: number;

  @IsString()
  @IsNotEmpty({ message: requiredMessage })
  @MaxLength(32, { message: lengthMessage('max') })
  cin: string;

  @IsString()
  @IsNotEmpty({ message: requiredMessage })
  @MaxLength(150, { message: lengthMessage('max') })
  job: string;

  @IsString()
  @IsNotEmpty({ message: requiredMessage })
  @MaxLength(255, { message: lengthMessage('max') })
  path: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  skillIds?: number[];
}
