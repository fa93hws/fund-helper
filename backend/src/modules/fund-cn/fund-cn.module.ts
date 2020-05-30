import { Module } from '@nestjs/common';
import { FundCNController } from './fund-cn.controller';
import { EastMoneyModule } from './eastmoney/eastmoney.module';
import { FundValueCNService } from './fund-value.service';
import { FundInfoCNService } from './fund-info.service';
import { PGSqlModule } from '../database/pg.module';
import { BunyanLogModule } from '../log/bunyan.module';

@Module({
  imports: [EastMoneyModule, PGSqlModule, BunyanLogModule.register('fund-cn')],
  controllers: [FundCNController],
  providers: [FundValueCNService, FundInfoCNService],
})
export class FundCNModule {}
