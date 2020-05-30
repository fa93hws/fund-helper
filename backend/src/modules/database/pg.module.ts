import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { PGService } from './pg.service';

@Module({
  imports: [ConfigModule],
  providers: [PGService],
  exports: [PGService],
})
export class PGSqlModule {}
