import { Module } from '@nestjs/common';
import { FundCNController } from './fund-cn.controller';
import { EastMoneyModule } from './eastmoney/eastmoney.module';
import { FundCNService } from './fund-cn.service';
import { PGSqlModule } from '../database/pg.module';
import { BunyanLogModule } from '../log/bunyan.module';

@Module({
  imports: [EastMoneyModule, PGSqlModule, BunyanLogModule.register('fund-cn')],
  controllers: [FundCNController],
  providers: [FundCNService],
})
export class FundCNModule {}
