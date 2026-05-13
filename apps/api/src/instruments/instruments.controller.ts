import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { InstrumentsService } from './instruments.service';
import { GenerateInstrumentDto } from './dto/generate-instrument.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/instruments')
@UseGuards(JwtAuthGuard)
export class InstrumentsController {
  constructor(private instrumentsService: InstrumentsService) {}

  @Post('generate')
  generate(
    @Body() dto: GenerateInstrumentDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.instrumentsService.generate(dto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: { id: string; role: string }) {
    return this.instrumentsService.findAll(user.id, user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.instrumentsService.findOne(id);
  }

  @Get(':id/download')
  download(@Param('id') id: string, @Res() res: Response) {
    return this.instrumentsService.download(id, res);
  }
}
