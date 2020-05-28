import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { FundCNModule } from './modules/cn-fund/fund-cn.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(FundCNModule);
  app.setGlobalPrefix('api/v1');
  await app.listen(3000);
}

bootstrap();
