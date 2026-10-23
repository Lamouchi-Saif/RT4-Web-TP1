import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import {
  lengthMessage,
  requiredMessage,
} from '../../shared/error-messages.js';

// Data the client must send to create a todo.
// id, createdAt and status are NOT here: the server generates them.
export class AddTodoDto {
  // Required, a string, between 3 and 10 characters
  @IsNotEmpty({ message: requiredMessage })
  @IsString()
  @MinLength(3, { message: lengthMessage('min') })
  @MaxLength(10, { message: lengthMessage('max') })
  name: string;

  // Required, a string, at least 10 characters
  @IsNotEmpty({ message: requiredMessage })
  @IsString()
  @MinLength(10, { message: lengthMessage('min') })
  description: string;
}