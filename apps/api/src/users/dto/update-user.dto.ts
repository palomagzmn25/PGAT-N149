import { IsBoolean, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'CAPTURISTA', 'REVISOR'])
  role?: 'ADMIN' | 'CAPTURISTA' | 'REVISOR';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
