import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './database/seeds/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: [process.env.FRONTEND_URL as string] },
  });

  const seedService = app.get(SeedService);
  await seedService.seedAdminUser();

  await app.listen(process.env.PORT ?? 8000);
}

bootstrap();
