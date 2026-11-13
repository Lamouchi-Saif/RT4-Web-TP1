import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { lengthMessage, requiredMessage } from '../../shared/error-messages.js';

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty({ message: requiredMessage })
  @MaxLength(100, { message: lengthMessage('max') })
  designation: string;
}
