import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  log(data: {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    ip?: string;
    metadata?: Record<string, string | number | boolean | null>;
  }) {
    return this.prisma.auditLog.create({ data }).catch(() => null);
  }

  findAll() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { user: { select: { name: true, email: true } } },
    });
  }

  async getDashboardStats() {
    const [totalDocuments, totalOcr, totalTemplates, recentDocuments] =
      await Promise.all([
        this.prisma.generatedDocument.count({ where: { status: 'COMPLETED' } }),
        this.prisma.ocrJob.count({ where: { status: 'COMPLETED' } }),
        this.prisma.template.count({ where: { isActive: true } }),
        this.prisma.generatedDocument.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            template: { select: { name: true } },
            user: { select: { name: true } },
          },
        }),
      ]);

    return { totalDocuments, totalOcr, totalTemplates, recentDocuments };
  }
}
