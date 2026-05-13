import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { readFileSync } from 'fs';
import * as PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTemplateDto, filePath: string, userId: string) {
    const placeholders = this.extractPlaceholders(filePath);
    return this.prisma.template.create({
      data: {
        name: dto.name,
        type: dto.type,
        description: dto.description,
        filePath,
        placeholders,
        createdById: userId,
      },
    });
  }

  findAll() {
    return this.prisma.template.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { name: true, email: true } },
        _count: { select: { documents: true } },
      },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: { createdBy: { select: { name: true } } },
    });
    if (!template) throw new NotFoundException('Plantilla no encontrada');
    return template;
  }

  async remove(id: string) {
    const template = await this.findOne(id);
    await this.prisma.template.update({
      where: { id: template.id },
      data: { isActive: false },
    });
    return { message: 'Plantilla eliminada' };
  }

  extractPlaceholders(filePath: string): string[] {
    try {
      const content = readFileSync(filePath);
      const zip = new (PizZip as any)(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        // Dry run — collect tags without throwing on missing values
        parser: () => ({
          get: (scope: any, context: any) => {
            const tag = context?.meta?.part?.value;
            return tag ?? '';
          },
        }),
      });

      const text = doc.getFullText();
      const matches: string[] = text.match(/\{\{[^}]+\}\}/g) ?? [];
      const unique = [...new Set(matches.map((m: string) => m.replace(/[{}]/g, '').trim()))];
      return unique.filter((p: string) => !p.startsWith('#') && !p.startsWith('/'));
    } catch {
      // Fallback: parse raw XML for {{...}} tags
      return this.extractPlaceholdersFromRaw(filePath);
    }
  }

  private extractPlaceholdersFromRaw(filePath: string): string[] {
    try {
      const content = readFileSync(filePath);
      const zip = new (PizZip as any)(content);
      const documentXml = zip.files['word/document.xml']?.asText() ?? '';
      const raw = documentXml.replace(/<[^>]+>/g, '');
      const matches: string[] = raw.match(/\{\{[^}]+\}\}/g) ?? [];
      const unique = [...new Set(matches.map((m: string) => m.replace(/[{}]/g, '').trim()))];
      return unique.filter((p: string) => !p.startsWith('#') && !p.startsWith('/'));
    } catch {
      return [];
    }
  }
}
