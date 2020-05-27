import { Module } from '@nestjs/common';
import { FundValuesController } from './values.controller';
import { EastMoneyModule } from './eastmoney/eastmoney.module';
import { FundValueService } from './values.service';

@Module({
  imports: [EastMoneyModule],
  controllers: [FundValuesController],
  providers: [FundValueService],
})
export class FundValuesModule {}
