import { Module } from '@nestjs/common';
import { FundValuesController } from './values.controller';
import { EastMoneyModule } from './eastmoney/eastmoney.module';
import { FundValueService } from './values.service';
import { createPGServiceFactory } from '../../services/database/pg.factory';
import { PGService } from '../../services/database/pg.service';

@Module({
  imports: [EastMoneyModule],
  controllers: [FundValuesController],
  providers: [
    FundValueService,
    {
      provide: PGService,
      useFactory: createPGServiceFactory,
    },
  ],
})
export class FundValuesModule {}
