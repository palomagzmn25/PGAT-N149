import { IsObject, IsString } from 'class-validator';

export class GenerateInstrumentDto {
  @IsString()
  templateId: string;

  @IsString()
  instrumentType: string;

  @IsObject()
  formData: Record<string, unknown>;
}
