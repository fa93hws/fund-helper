import { DynamicModule, Module } from '@nestjs/common';
import { createHash } from 'crypto';
import { BunyanLogService } from './bunyan.service';
import { providerNames } from '../../utils/providers';

@Module({
  providers: [
    {
      provide: providerNames.requestId,
      useFactory: () => {
        const data = (Date.now() + Math.random()).toFixed(5);
        return createHash('md5').update(data).digest('hex');
      },
    },
  ],
  exports: [providerNames.requestId],
})
class RequestIdModule {}

@Module({})
export class BunyanLogModule {
  static register(moduleName: string): DynamicModule {
    return {
      module: BunyanLogModule,
      imports: [RequestIdModule],
      providers: [
        {
          provide: providerNames.moduleName,
          useValue: moduleName,
        },
        BunyanLogService,
      ],
      exports: [BunyanLogService],
    };
  }
}
