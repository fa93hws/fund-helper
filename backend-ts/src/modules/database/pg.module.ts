import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { PGService } from './pg.service';
import { PGConfigProvider } from '../config/pg-config.provider';
// import { pgServiceFactory } from './pg.factory';

@Module({
  imports: [ConfigModule],
  providers: [PGService],
  exports: [PGService],
})
export class PGSqlModule {}
