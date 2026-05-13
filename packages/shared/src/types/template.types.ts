export type InstrumentType = 'sociedad_anonima' | 'poder_notarial' | 'custom';

export interface TemplateDto {
  id: string;
  name: string;
  type: InstrumentType;
  description?: string;
  version: number;
  placeholders: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDto {
  name: string;
  type: InstrumentType;
  description?: string;
}
