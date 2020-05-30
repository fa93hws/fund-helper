import { Module } from '@nestjs/common';
import { PGService } from './pg.service';
import { pgServiceFactory } from './pg.factory';

@Module({
  providers: [
    {
      provide: PGService,
      useFactory: pgServiceFactory,
    },
  ],
  exports: [PGService],
})
export class PGSqlModule {}
