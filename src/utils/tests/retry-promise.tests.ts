import { retryPromise } from '../retry-promise';

/* eslint-disable prefer-promise-reject-errors */
describe('retryPromise', () => {
  it('retries the promise', async () => {
    let count = 0;
    const promiseFactory = () =>
      new Promise((res, rej) => (++count > 1 ? res(count) : rej()));
    const res = await retryPromise(promiseFactory, 6);
    expect(res).toEqual(2);
  });

  it('retries given times only', async () => {
    let count = 0;
    const promiseFactory = () => new Promise((_, rej) => rej(++count));
    const promise = retryPromise(promiseFactory, 6);
    await expect(promise).rejects.toEqual(7);
  });
});
