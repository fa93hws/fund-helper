import { runInPool, PromisePool } from '../promise-pool';

describe('runInPool', () => {
  it('resolves the value eventually', async () => {
    const generatePromise = (idx: number) =>
      new Promise((resolve) => {
        setTimeout(() => resolve(idx), 10 - idx);
      }) as Promise<number>;

    const result = await runInPool({
      generatePromise,
      totalNumber: 5,
      maxConcurrency: 3,
    });
    expect(result).toEqual({
      kind: 'ok',
      data: [0, 1, 2, 3, 4],
    });
  });

  it('return errors if rejected', async () => {
    const generatePromise = (idx: number) =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (idx !== 4) {
            resolve(idx);
          } else {
            reject(idx);
          }
        }, 10 - idx);
      }) as Promise<number>;

    const result = await runInPool({
      generatePromise,
      totalNumber: 5,
      maxConcurrency: 3,
    });
    expect(result).toEqual({
      kind: 'error',
      error: 4,
    });
  });
});

describe('PromisePool', () => {
  // A generator that always resolves
  function* resolvesGenerator(total: number) {
    let idx = 0;
    while (idx < total) {
      yield {
        idx,
        promise: ((i: number) =>
          new Promise((resolve) => {
            setTimeout(() => resolve(i), 10);
          }))(idx),
      };
      idx += 1;
    }
  }

  function flushPromises() {
    return new Promise((resolve) => setImmediate(resolve));
  }

  it('run workers number = maxConcurrency', async () => {
    jest.useFakeTimers();
    const generator = resolvesGenerator(7);
    const pool = new PromisePool(generator, 3);
    pool.run();
    await flushPromises();
    jest.advanceTimersByTime(9);
    expect(pool.results).toEqual([]);
    jest.advanceTimersByTime(2);
    await flushPromises();
    expect(pool.results).toEqual([0, 1, 2]);
    jest.advanceTimersByTime(10);
    await flushPromises();
    expect(pool.results).toEqual([0, 1, 2, 3, 4, 5]);
    jest.advanceTimersByTime(10);
    await flushPromises();
    expect(pool.results).toEqual([0, 1, 2, 3, 4, 5, 6]);
    jest.advanceTimersByTime(100000);
    await flushPromises();
    expect(pool.results).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(pool.error).toBeUndefined();
    jest.clearAllTimers();
  });

  it('resolves results at once if max concurrency > total number', async () => {
    jest.useFakeTimers();
    const generator = resolvesGenerator(2);
    const pool = new PromisePool(generator, 3);
    pool.run();
    await flushPromises();
    jest.advanceTimersByTime(9);
    expect(pool.results).toEqual([]);
    jest.advanceTimersByTime(2);
    await flushPromises();
    expect(pool.results).toEqual([0, 1]);
    jest.advanceTimersByTime(100000);
    await flushPromises();
    expect(pool.results).toEqual([0, 1]);
    expect(pool.error).toBeUndefined();
    jest.clearAllTimers();
  });

  it('stops when error occour', async () => {
    function* rejectGenerator(total: number) {
      let idx = 0;
      while (idx < total) {
        yield {
          idx,
          promise: ((i: number) =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                if (i !== 2) {
                  resolve(i);
                } else {
                  reject(i);
                }
              }, 10);
            }))(idx),
        };
        idx += 1;
      }
    }

    jest.useFakeTimers();
    const generator = rejectGenerator(20);
    const pool = new PromisePool(generator, 3);
    pool.run();
    await flushPromises();
    jest.advanceTimersByTime(9);
    expect(pool.results).toEqual([]);
    jest.advanceTimersByTime(100000);
    await flushPromises();
    expect(pool.results.length).toBeLessThan(6);
    expect(pool.error).toEqual(2);
    jest.clearAllTimers();
  });
});
