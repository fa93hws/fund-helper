import { Module } from '@nestjs/common';
import { FundValuesController } from './values.controller';
import { EastMoneyModule } from './eastmoney/eastmoney.module';

@Module({
  imports: [EastMoneyModule],
  controllers: [FundValuesController],
  providers: [],
})
export class FundValuesModule {}
