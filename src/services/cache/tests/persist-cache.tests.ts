import { PersistCacheService } from '../persist-cache';
import { LocalIOService } from '../../local-io/local-io';

describe('PersistCacheService', () => {
  const write = jest.fn();
  const read = jest.fn();
  const ioService = ({ write, read } as any) as LocalIOService;
  const cacheService = new PersistCacheService(ioService);
  const now = 100;
  (Date as any).now = jest.spyOn(Date, 'now').mockImplementation(() => now);
  const value = { foo: 'bar' };

  afterEach(() => {
    write.mockRestore();
    read.mockRestore();
  });

  it('writes to file when set', () => {
    cacheService.set({ key: 'key', value, version: 'v1' });
    expect(write).toHaveBeenCalledWith('key.json', {
      value,
      version: 'v1',
      timeStamp: 100,
    });
  });

  it('return not found if there is no cache', () => {
    read.mockReturnValueOnce({ kind: 'notFound' });
    const result = cacheService.get({ key: 'key', age: 100, version: 'v1' });
    expect(read).toHaveBeenCalledWith('key.json');
    expect(result.kind).toEqual('notFound');
  });

  it('complains bad cache if date is not number', () => {
    read.mockReturnValueOnce({
      kind: 'success',
      content: JSON.stringify({
        value,
        version: 'v1',
        key: 'key',
        timeStamp: 'now',
      }),
    });
    const result = cacheService.get({ key: 'key', age: 100, version: 'v1' });
    expect(read).toHaveBeenCalledWith('key.json');
    expect(result.kind).toEqual('badCache');
  });

  it('complains bad cache if version is not string', () => {
    read.mockReturnValueOnce({
      kind: 'success',
      content: JSON.stringify({
        value,
        version: 1,
        timeStamp: now,
      }),
    });
    const result = cacheService.get({ key: 'key', age: 100, version: 'v1' });
    expect(read).toHaveBeenCalledWith('key.json');
    expect(result.kind).toEqual('badCache');
  });

  it('complains bad cache if version does not match', () => {
    read.mockReturnValueOnce({
      kind: 'success',
      content: JSON.stringify({
        value,
        version: 'v2',
        timeStamp: now,
      }),
    });
    const result = cacheService.get({ key: 'key', age: 100, version: 'v1' });
    expect(read).toHaveBeenCalledWith('key.json');
    expect(result.kind).toEqual('badCache');
  });

  it('complains outdated cache if age is short enough does not match', () => {
    read.mockReturnValueOnce({
      kind: 'success',
      content: JSON.stringify({
        value,
        version: 'v1',
        timeStamp: 90,
      }),
    });
    const result = cacheService.get({ key: 'key', age: 9, version: 'v1' });
    expect(read).toHaveBeenCalledWith('key.json');
    expect(result.kind).toEqual('outdated');
  });

  it('complains bad cache if it is not an object', () => {
    read.mockReturnValueOnce({
      kind: 'success',
      content: JSON.stringify({
        value: '123',
        version: 'v1',
        timeStamp: 90,
      }),
    });
    const result = cacheService.get({ key: 'key', age: 9, version: 'v1' });
    expect(read).toHaveBeenCalledWith('key.json');
    if (result.kind === 'badCache') {
      expect(result.reason).toMatchInlineSnapshot(
        `"unable to parse key, value must be object"`,
      );
    } else {
      throw new Error('kind must be badCache');
    }
  });

  it('retrive the cache contents', () => {
    read.mockReturnValueOnce({
      kind: 'success',
      content: JSON.stringify({
        value,
        version: 'v1',
        timeStamp: 90,
      }),
    });
    const result = cacheService.get({ key: 'key', age: 11, version: 'v1' });
    expect(read).toHaveBeenCalledWith('key.json');
    expect(result).toEqual({
      kind: 'success',
      result: value,
    });
  });
});
