import { Result } from '@fund-helper/utils/result-type';

type PromiseGenerator<T> = (idx: number) => Promise<T>;

// export for testing only
export class PromisePool<T> {
  error?: any;

  results = new Array<T>();

  constructor(
    private readonly promiseIterator: Generator<
      { promise: Promise<T>; idx: number },
      void,
      void
    >,
    private readonly maxConcurrency: number,
  ) {}

  private async runInWorker() {
    const nextPromise = this.promiseIterator.next();
    if (nextPromise.done || this.error != null) {
      return;
    }
    const { promise, idx } = nextPromise.value;
    try {
      const result = await promise;
      if (this.error == null) {
        this.results[idx] = result;
      }
      await this.runInWorker();
    } catch (e) {
      this.error = e;
    }
  }

  async run(): Promise<Result.T<T[]>> {
    const workerPromises = new Array(this.maxConcurrency)
      .fill(0)
      .map(() => this.runInWorker());
    await Promise.all(workerPromises);
    if (this.error == null) {
      return Result.createOk(this.results);
    }
    return Result.createError(this.error);
  }
}

function* toGenerator<T>(
  generatePromise: PromiseGenerator<T>,
  totalNumber: number,
) {
  let idx = 0;
  while (idx < totalNumber) {
    yield {
      idx,
      promise: generatePromise(idx),
    };
    idx += 1;
  }
}

export async function runInPool<T>({
  generatePromise,
  maxConcurrency,
  totalNumber,
}: {
  generatePromise: PromiseGenerator<T>;
  maxConcurrency: number;
  totalNumber: number;
}): Promise<Result.T<T[]>> {
  const generator = toGenerator(generatePromise, totalNumber);
  const pool = new PromisePool(generator, maxConcurrency);
  return pool.run();
}
