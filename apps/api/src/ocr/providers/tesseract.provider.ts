import { Injectable, Logger } from '@nestjs/common';
import Tesseract from 'tesseract.js';
import { IOcrProvider, OcrResult } from './ocr.interface';

@Injectable()
export class TesseractProvider implements IOcrProvider {
  readonly name = 'tesseract';
  private readonly logger = new Logger(TesseractProvider.name);

  async process(buffer: Buffer, _mimeType: string): Promise<OcrResult> {
    this.logger.log('Processing with Tesseract OCR...');

    try {
      const result = await Tesseract.recognize(buffer, 'spa', {
        logger: () => {},
      });

      const text = result.data.text;
      const lines = text.split('\n');
      const illegibleSections: { page: number; fragment: string }[] = [];

      // Detect potentially illegible sequences (very short words surrounded by noise)
      const cleaned = lines
        .map((line) => {
          if (line.trim().length > 0 && this.isLikelyGarbage(line)) {
            illegibleSections.push({ page: 1, fragment: line.trim() });
            return '[ilegible]';
          }
          return line;
        })
        .join('\n');

      return {
        pages: [{ pageNumber: 1, text: cleaned }],
        illegibleSections,
      };
    } catch (err: any) {
      this.logger.error(`Tesseract error: ${err?.message}`);
      throw err;
    }
  }

  private isLikelyGarbage(line: string): boolean {
    const trimmed = line.trim();
    if (trimmed.length < 3) return false;
    // High ratio of non-alphanumeric characters suggests noise
    const nonAlpha = (trimmed.match(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s0-9.,;:¿?¡!()"'-]/g) ?? []).length;
    return nonAlpha / trimmed.length > 0.6;
  }
}
