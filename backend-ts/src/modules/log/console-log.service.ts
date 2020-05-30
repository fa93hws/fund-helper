import { Injectable, Logger, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class ConsoleLogService {
  private readonly logger: Logger;
  constructor() {
    this.logger = new Logger('**', true);
  }

  setContext(context: string) {
    this.logger.setContext(context);
  }

  info(msg: string, contextObj?: object) {
    const context = contextObj == null ? undefined : JSON.stringify(contextObj);
    this.logger.debug(msg, context);
  }

  error(msg: string, contextObj?: object) {
    const context = contextObj == null ? undefined : JSON.stringify(contextObj);
    this.logger.error(msg, new Error().stack, context);
  }
}
