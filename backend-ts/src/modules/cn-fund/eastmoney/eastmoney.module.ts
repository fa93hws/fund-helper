import { Module, HttpModule } from '@nestjs/common';
import { EastMoneyService } from './eastmoney.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [EastMoneyService],
  exports: [EastMoneyService],
})
export class EastMoneyModule {}
