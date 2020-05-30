import { Module } from '@nestjs/common';
import { EnvProvider } from './env.provider';
import { PGConfigProvider } from './pg-config.provider';
import { ConsoleLogService } from '../log/console-log.service';

@Module({
  providers: [EnvProvider, PGConfigProvider, ConsoleLogService],
  exports: [PGConfigProvider],
})
export class ConfigModule {}
