import * as Debug from 'debug';

const debug = Debug('retry-promise').extend('debug');

export async function retryPromise<T>(
  promiseFactory: () => Promise<T>,
  numRetry: number,
): Promise<T> {
  try {
    return await promiseFactory();
  } catch (e) {
    if (numRetry <= 0) {
      throw e;
    }
    debug('retrying!');
    return retryPromise(promiseFactory, numRetry - 1);
  }
}
