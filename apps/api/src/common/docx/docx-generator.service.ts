import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import * as PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

@Injectable()
export class DocxGeneratorService {
  generate(templatePath: string, data: Record<string, unknown>): string {
    try {
      const content = readFileSync(templatePath);
      const zip = new (PizZip as any)(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render(data);

      const buffer = doc.getZip().generate({ type: 'nodebuffer' });
      const outputDir = join(process.cwd(), 'uploads', 'generated');
      mkdirSync(outputDir, { recursive: true });

      const outputPath = join(outputDir, `${randomUUID()}.docx`);
      writeFileSync(outputPath, buffer);
      return outputPath;
    } catch (err: any) {
      throw new InternalServerErrorException(
        `Error generando DOCX: ${err?.message ?? 'Error desconocido'}`,
      );
    }
  }
}
