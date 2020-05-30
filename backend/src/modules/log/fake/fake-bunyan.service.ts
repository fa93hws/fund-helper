import { BunyanLogService } from '../bunyan.service';

export const fakeBunyanLogService: BunyanLogService = {
  info: () => undefined,
  error: () => undefined,
} as any;
