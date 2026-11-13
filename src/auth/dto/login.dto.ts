import { IsString, Length, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @Length(3, 100)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
