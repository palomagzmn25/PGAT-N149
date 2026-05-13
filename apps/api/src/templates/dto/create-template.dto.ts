import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsEnum(['sociedad_anonima', 'poder_notarial', 'custom'])
  type: 'sociedad_anonima' | 'poder_notarial' | 'custom';

  @IsOptional()
  @IsString()
  description?: string;
}
