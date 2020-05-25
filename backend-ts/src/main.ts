import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { FundValuesModule } from './fund-values/fund-values-module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    FundValuesModule,
  );
  await app.listen(3000);
}

bootstrap();
