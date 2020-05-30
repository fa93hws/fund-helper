import { ConsoleLogService } from '../console-log.service';

export const fakeConsoleLogService: ConsoleLogService = {
  info: () => undefined,
  error: () => undefined,
  setContext: () => undefined,
} as any;
