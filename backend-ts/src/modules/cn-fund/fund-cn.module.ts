import { Module } from '@nestjs/common';
import { FundCNController } from './fund-cn.controller';
import { EastMoneyModule } from './eastmoney/eastmoney.module';
import { FundCNService } from './fund-cn.service';
import { createPGServiceFactory } from '../../services/database/pg.factory';
import { PGService } from '../../services/database/pg.service';

@Module({
  imports: [EastMoneyModule],
  controllers: [FundCNController],
  providers: [
    FundCNService,
    {
      provide: PGService,
      useFactory: createPGServiceFactory,
    },
  ],
})
export class FundCNModule {}
