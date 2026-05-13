import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IOcrProvider, OcrResult } from './ocr.interface';

// Placeholder for Claude Vision OCR provider
// Requires: ANTHROPIC_API_KEY environment variable
@Injectable()
export class ClaudeProvider implements IOcrProvider {
  readonly name = 'claude';
  private readonly logger = new Logger(ClaudeProvider.name);

  constructor(private configService: ConfigService) {}

  async process(buffer: Buffer, mimeType: string): Promise<OcrResult> {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY no configurado');

    this.logger.log('Processing with Claude Vision OCR...');

    // Convert buffer to base64
    const base64Image = buffer.toString('base64');
    const mediaType = mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-7',
        max_tokens: 8096,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: base64Image },
              },
              {
                type: 'text',
                text: `Transcribe EXACTAMENTE el texto de este documento escaneado.
                Reglas estrictas:
                - Preserva saltos de línea, espaciado, párrafos y alineaciones tal como aparecen
                - NO corrijas ortografía ni gramática
                - NO interpretes ni resumas el contenido
                - Texto ilegible completo: escribe [ilegible]
                - Texto parcialmente ilegible: escribe la parte legible[ilegible]
                - Conserva tablas y estructuras visuales
                - Responde SOLO con el texto transcrito, sin comentarios`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json() as any;
    const text = data?.content?.[0]?.text ?? '';

    return {
      pages: [{ pageNumber: 1, text }],
      illegibleSections: this.extractIlegible(text, 1),
    };
  }

  private extractIlegible(text: string, page: number) {
    const sections: { page: number; fragment: string }[] = [];
    const regex = /\[ilegible\]/gi;
    const lines = text.split('\n');
    lines.forEach((line) => {
      if (regex.test(line)) {
        sections.push({ page, fragment: line.trim() });
        regex.lastIndex = 0;
      }
    });
    return sections;
  }
}
