import { Module } from '@nestjs/common';
import { FundValuesController } from './fund-values-controller';

@Module({
  imports: [],
  controllers: [FundValuesController],
  providers: [],
})
export class FundValuesModule {}
