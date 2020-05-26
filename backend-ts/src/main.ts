import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { FundValuesModule } from './modules/cn-fund/values.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    FundValuesModule,
  );
  app.setGlobalPrefix('api/v1');
  await app.listen(3000);
}

bootstrap();
