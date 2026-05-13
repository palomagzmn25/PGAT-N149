import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get('dashboard/stats')
  getDashboardStats() {
    return this.auditService.getDashboardStats();
  }

  @Get('audit-logs')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.auditService.findAll();
  }
}
