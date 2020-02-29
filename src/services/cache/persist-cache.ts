import { LocalIOService } from '../local-io/local-io';

type PersistCacheOutput = {
  value: object;
  version: string;
  // javascript timestamp (in ms)
  timeStamp: number;
};

type CacheGetResult =
  | { kind: 'success'; result: object }
  | { kind: 'outdated' | 'notFound' }
  | { kind: 'badCache'; reason: string };

export class PersistCacheService {
  constructor(private readonly ioService: LocalIOService) {}

  set({
    key,
    value,
    version,
  }: {
    key: string;
    value: object;
    version: string;
  }) {
    const output: PersistCacheOutput = {
      value,
      timeStamp: new Date().getTime(),
      version,
    };
    this.ioService.write(`${key}.json`, output);
  }

  private static assertCacheContent(key: string, content: any) {
    if (typeof content.timeStamp !== 'number') {
      return {
        kind: 'badCache' as const,
        reason: `unable to parse ${key}, timestamp must be number`,
      };
    }
    if (typeof content.value !== 'object') {
      return {
        kind: 'badCache' as const,
        reason: `unable to parse ${key}, value must be object`,
      };
    }
    if (typeof content.version !== 'string') {
      return {
        kind: 'badCache' as const,
        reason: `unable to parse ${key}, version must be string`,
      };
    }
    return content as PersistCacheOutput;
  }

  // age: ms
  get({
    key,
    age,
    version,
  }: {
    key: string;
    age: number;
    version: string;
  }): CacheGetResult {
    const cacheReadResult = this.ioService.read(`${key}.json`);
    if (cacheReadResult.kind === 'notFound') {
      return { kind: 'notFound' };
    }
    const { content } = cacheReadResult;
    try {
      const cacheContent = JSON.parse(content);
      const parsedCacheContent = PersistCacheService.assertCacheContent(
        key,
        cacheContent,
      );
      if ('kind' in parsedCacheContent) {
        return parsedCacheContent;
      }
      if (parsedCacheContent.version !== version) {
        return { kind: 'badCache', reason: 'version is different' };
      }

      const now = new Date().getTime();
      if (parsedCacheContent.timeStamp + age > now) {
        return { kind: 'success', result: parsedCacheContent.value };
      }
      return { kind: 'outdated' };
    } catch {
      return {
        kind: 'badCache',
        reason: `unable to parse ${key}, content: ${content}`,
      };
    }
  }
}
