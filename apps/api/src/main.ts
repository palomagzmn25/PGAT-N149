import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://palomagzmn25.github.io',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  // Seed admin user if DB is empty
  const usersService = app.get(UsersService);
  await usersService.seedAdminIfEmpty();

  console.log(`API running on http://localhost:${port}`);
}
bootstrap();
