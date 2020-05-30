import { Module, HttpModule } from '@nestjs/common';
import { EastMoneyService } from './eastmoney.service';
import { BunyanLogModule } from '../../log/bunyan.module';

@Module({
  imports: [HttpModule, BunyanLogModule.register('eastmoney')],
  controllers: [],
  providers: [EastMoneyService],
  exports: [EastMoneyService],
})
export class EastMoneyModule {}
