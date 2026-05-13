import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { OcrService } from './ocr.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/ocr')
@UseGuards(JwtAuthGuard)
export class OcrController {
  constructor(private ocrService: OcrService) {}

  @Post('process')
  @UseInterceptors(FileInterceptor('file'))
  process(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: string },
    @Body('provider') provider?: string,
  ) {
    if (!file) throw new BadRequestException('Se requiere un archivo PDF, JPG o PNG');
    return this.ocrService.processFile(file, user.id, provider);
  }

  @Get()
  findAll(@CurrentUser() user: { id: string; role: string }) {
    return this.ocrService.findAll(user.id, user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ocrService.findOne(id);
  }

  @Get(':id/download')
  download(@Param('id') id: string, @Res() res: Response) {
    return this.ocrService.download(id, res);
  }
}
