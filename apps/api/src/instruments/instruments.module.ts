import { Module } from '@nestjs/common';
import { InstrumentsService } from './instruments.service';
import { InstrumentsController } from './instruments.controller';
import { TemplatesModule } from '../templates/templates.module';
import { DocxGeneratorService } from '../common/docx/docx-generator.service';

@Module({
  imports: [TemplatesModule],
  providers: [InstrumentsService, DocxGeneratorService],
  controllers: [InstrumentsController],
})
export class InstrumentsModule {}
