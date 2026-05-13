import { Injectable, NotFoundException } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { Response } from 'express';
import { basename } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { TemplatesService } from '../templates/templates.service';
import { DocxGeneratorService } from '../common/docx/docx-generator.service';
import { GenerateInstrumentDto } from './dto/generate-instrument.dto';
import { convertDateToWords } from '../common/converters/date.converter';
import {
  convertRfcToWords,
  convertCurpToWords,
  convertClaveElectorToWords,
} from '../common/converters/rfc.converter';

@Injectable()
export class InstrumentsService {
  constructor(
    private prisma: PrismaService,
    private templatesService: TemplatesService,
    private docxGenerator: DocxGeneratorService,
  ) {}

  async generate(dto: GenerateInstrumentDto, userId: string) {
    const template = await this.templatesService.findOne(dto.templateId);

    // Create DB record first
    const document = await this.prisma.generatedDocument.create({
      data: {
        templateId: dto.templateId,
        userId,
        instrumentType: dto.instrumentType,
        formData: dto.formData as any,
        status: 'PROCESSING',
      },
    });

    try {
      const processedData = this.applyConversions(dto.formData);
      const outputPath = this.docxGenerator.generate(
        template.filePath,
        processedData,
      );

      await this.prisma.generatedDocument.update({
        where: { id: document.id },
        data: { outputPath, status: 'COMPLETED' },
      });

      return { ...document, outputPath, status: 'COMPLETED' };
    } catch (err) {
      await this.prisma.generatedDocument.update({
        where: { id: document.id },
        data: { status: 'FAILED' },
      });
      throw err;
    }
  }

  findAll(userId: string, role: string) {
    const where = role === 'ADMIN' ? {} : { userId };
    return this.prisma.generatedDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        template: { select: { name: true, type: true } },
        user: { select: { name: true } },
      },
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.generatedDocument.findUnique({
      where: { id },
      include: { template: { select: { name: true } } },
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    return doc;
  }

  async download(id: string, res: Response) {
    const doc = await this.findOne(id);
    if (!doc.outputPath || !existsSync(doc.outputPath)) {
      throw new NotFoundException('Archivo no disponible');
    }
    const filename = basename(doc.outputPath);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${doc.template.name.replace(/\s+/g, '_')}_${filename}"`,
    });
    createReadStream(doc.outputPath).pipe(res);
  }

  private applyConversions(
    formData: Record<string, unknown>,
  ): Record<string, unknown> {
    const result = { ...formData };

    // Date fields: if value matches DD/MM/YYYY or YYYY-MM-DD, auto-convert
    const dateFields = [
      'fecha_nacimiento',
      'fecha_cud',
      'fecha_expedicion',
      'fecha_instrumento',
    ];
    for (const field of dateFields) {
      if (result[field] && typeof result[field] === 'string') {
        const key = `${field}_letra`;
        if (!result[key]) {
          result[key] = convertDateToWords(result[field] as string);
        }
      }
    }

    // RFC: if rfc present and rfc_letra not, auto-convert
    if (result['rfc'] && !result['rfc_letra']) {
      result['rfc_letra'] = convertRfcToWords(result['rfc'] as string);
    }
    if (result['rfc_administrador'] && !result['rfc_administrador_letra']) {
      result['rfc_administrador_letra'] = convertRfcToWords(
        result['rfc_administrador'] as string,
      );
    }
    if (result['rfc_comisario'] && !result['rfc_comisario_letra']) {
      result['rfc_comisario_letra'] = convertRfcToWords(
        result['rfc_comisario'] as string,
      );
    }

    // CURP
    if (result['curp'] && !result['curp_letra']) {
      result['curp_letra'] = convertCurpToWords(result['curp'] as string);
    }

    // Clave de elector
    if (result['clave_elector'] && !result['clave_elector_letra']) {
      result['clave_elector_letra'] = convertClaveElectorToWords(
        result['clave_elector'] as string,
      );
    }

    // Process socios array if present
    if (Array.isArray(result['socios'])) {
      result['socios'] = (result['socios'] as any[]).map((socio) => ({
        ...socio,
        rfc_letra:
          socio.rfc_letra || (socio.rfc ? convertRfcToWords(socio.rfc) : ''),
      }));
    }

    return result;
  }
}
