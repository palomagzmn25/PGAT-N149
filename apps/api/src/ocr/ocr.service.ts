import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import { PrismaService } from '../prisma/prisma.service';
import { TesseractProvider } from './providers/tesseract.provider';
import { ClaudeProvider } from './providers/claude.provider';
import { IOcrProvider, OcrResult } from './providers/ocr.interface';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private defaultProvider: IOcrProvider;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private tesseract: TesseractProvider,
    private claude: ClaudeProvider,
  ) {
    const providerName = configService.get('OCR_PROVIDER', 'tesseract');
    this.defaultProvider = providerName === 'claude' ? this.claude : this.tesseract;
    this.logger.log(`OCR default provider: ${this.defaultProvider.name}`);
  }

  private resolveProvider(requested?: string): IOcrProvider {
    if (requested === 'claude') return this.claude;
    if (requested === 'tesseract') return this.tesseract;
    return this.defaultProvider;
  }

  async processFile(
    file: Express.Multer.File,
    userId: string,
    requestedProvider?: string,
  ) {
    const provider = this.resolveProvider(requestedProvider);
    const job = await this.prisma.ocrJob.create({
      data: {
        userId,
        inputPath: file.path,
        status: 'PROCESSING',
        provider: provider.name,
      },
    });

    // Process asynchronously
    const buffer: Buffer = file.buffer ?? require('fs').readFileSync(file.path);
    this.runOcr(job.id, buffer, file.mimetype, provider).catch(
      (err) => this.logger.error(`OCR job ${job.id} failed: ${err?.message}`),
    );

    return { jobId: job.id, status: 'PROCESSING' };
  }

  private async runOcr(jobId: string, buffer: Buffer, mimeType: string, provider: IOcrProvider) {
    try {
      const result = await provider.process(buffer, mimeType);
      const rawText = this.formatTranscription(result);
      const errorReport = this.buildErrorReport(result);
      const outputPath = await this.generateDocx(result, rawText);

      await this.prisma.ocrJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          rawText,
          errorReport,
          outputPath,
          pageCount: result.pages.length,
        },
      });
    } catch (err: any) {
      await this.prisma.ocrJob.update({
        where: { id: jobId },
        data: { status: 'FAILED', errorReport: err?.message },
      });
    }
  }

  private formatTranscription(result: OcrResult): string {
    return result.pages
      .map(
        (p) =>
          `${'='.repeat(20)}\nPÁGINA ${p.pageNumber}\n${'='.repeat(20)}\n\n${p.text}`,
      )
      .join('\n\n');
  }

  private buildErrorReport(result: OcrResult): string {
    if (result.illegibleSections.length === 0) return '';
    const lines = ['--- TEXTO NO RECONOCIDO ---', ''];
    const byPage: Record<number, string[]> = {};
    for (const s of result.illegibleSections) {
      byPage[s.page] = byPage[s.page] ?? [];
      byPage[s.page].push(`- "${s.fragment}"`);
    }
    for (const [page, frags] of Object.entries(byPage)) {
      lines.push(`Página ${page}:`);
      lines.push(...frags);
      lines.push('');
    }
    return lines.join('\n');
  }

  private async generateDocx(result: OcrResult, _rawText: string): Promise<string> {
    const children: Paragraph[] = [];

    for (const page of result.pages) {
      children.push(
        new Paragraph({
          text: `PÁGINA ${page.pageNumber}`,
          heading: HeadingLevel.HEADING_2,
        }),
      );

      const lines = page.text.split('\n');
      for (const line of lines) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: line, size: 24, font: 'Times New Roman' })],
          }),
        );
      }
    }

    const doc = new Document({ sections: [{ children }] });
    const buffer = await Packer.toBuffer(doc);

    const outputDir = join(process.cwd(), 'uploads', 'ocr');
    mkdirSync(outputDir, { recursive: true });
    const outputPath = join(outputDir, `${randomUUID()}.docx`);
    writeFileSync(outputPath, buffer);
    return outputPath;
  }

  findAll(userId: string, role: string) {
    const where = role === 'ADMIN' ? {} : { userId };
    return this.prisma.ocrJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        provider: true,
        pageCount: true,
        inputPath: true,
        outputPath: true,
        createdAt: true,
        errorReport: true,
      },
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.ocrJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Trabajo OCR no encontrado');
    return job;
  }

  async download(id: string, res: Response) {
    const job = await this.findOne(id);
    if (!job.outputPath || !existsSync(job.outputPath)) {
      throw new NotFoundException('Archivo no disponible');
    }
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="transcripcion_${id}.docx"`,
    });
    createReadStream(job.outputPath).pipe(res);
  }
}
