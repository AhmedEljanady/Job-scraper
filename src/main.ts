import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cors from 'cors';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.use(
    cors({
      origin: 'https://job-scraper-g012.onrender.com',
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    }),
  );
  app.useStaticAssets(join(__dirname, '..', 'frontend'));
  await app.listen(3000);
}
bootstrap();
