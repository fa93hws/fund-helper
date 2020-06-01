import { Inject, Injectable, Scope } from '@nestjs/common';
import * as Bunyan from 'bunyan';
import { providerNames } from '../../utils/providers';

const logger = Bunyan.createLogger({ name: 'fund-helper' });

@Injectable({ scope: Scope.REQUEST })
export class BunyanLogService {
  private readonly logger: Bunyan;

  constructor(
    @Inject(providerNames.moduleName) moduleName: string,
    @Inject(providerNames.requestId) requestId: string,
  ) {
    this.logger = logger.child({ moduleName, requestId });
  }

  info(message: string, param: Record<string, unknown> = {}) {
    this.logger.info(message, param);
  }

  error(message: string, param: Record<string, unknown> = {}) {
    this.logger.error(message, param);
  }
}
