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
    return retryPromise(promiseFactory, numRetry - 1);
  }
}
