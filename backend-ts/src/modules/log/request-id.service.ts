import { Injectable, Scope } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable({ scope: Scope.REQUEST })
export class RequestIdProvider {
  readonly requestId: string;

  constructor() {
    const data = (Date.now() + Math.random()).toFixed(5);
    this.requestId = createHash('md5').update(data).digest('hex');
  }
}
