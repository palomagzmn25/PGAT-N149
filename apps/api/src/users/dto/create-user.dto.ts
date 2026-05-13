import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsEnum(['ADMIN', 'CAPTURISTA', 'REVISOR'])
  role: 'ADMIN' | 'CAPTURISTA' | 'REVISOR';
}
