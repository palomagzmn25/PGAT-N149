import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { ...dto, password: hashedPassword },
    });

    const { password: _p, ...result } = user;
    return result;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findByIdOrThrow(id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 12);
    }
    const updated = await this.prisma.user.update({ where: { id }, data });
    const { password: _p, ...result } = updated;
    return result;
  }

  async remove(id: string) {
    await this.findByIdOrThrow(id);
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'Usuario desactivado' };
  }

  private async findByIdOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async seedAdminIfEmpty() {
    const count = await this.prisma.user.count();
    if (count === 0) {
      await this.create({
        email: 'admin@notaria.mx',
        password: 'Admin123!',
        name: 'Administrador',
        role: 'ADMIN',
      });
      console.log('Admin seed: admin@notaria.mx / Admin123!');
    }
  }
}
