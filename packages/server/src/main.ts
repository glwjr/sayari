import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './database/seeds/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [process.env.FRONTEND_URL].filter((v): v is string => !!v),
  });

  const seedService = app.get(SeedService);
  await seedService.seedAdminUser();

  await app.listen(process.env.PORT ?? 8000);
}

bootstrap();
