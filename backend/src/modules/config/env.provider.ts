import { Injectable } from '@nestjs/common';
import { ConsoleLogService } from '../log/console-log.service';

@Injectable()
export class EnvProvider {
  readonly env: 'prod' | 'dev';
  constructor(logService: ConsoleLogService) {
    logService.setContext(EnvProvider.name);
    this.env = process.env.DEV ? 'dev' : 'prod';
    logService.info(`env is ${this.env}`);
  }
}
