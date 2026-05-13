import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { OcrService } from './ocr.service';
import { OcrController } from './ocr.controller';
import { TesseractProvider } from './providers/tesseract.provider';
import { ClaudeProvider } from './providers/claude.provider';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'ocr'),
        filename: (_req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Solo PDF, JPG o PNG'), false);
        }
      },
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  ],
  providers: [OcrService, TesseractProvider, ClaudeProvider],
  controllers: [OcrController],
})
export class OcrModule {}
