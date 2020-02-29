import { calculateSum, calculateAverage } from '../math';

describe('calculateSum', () => {
  it('calculate the sums for [1,2,3,4] to 10', () => {
    const arr = [1, 2, 3, 4];
    expect(calculateSum(arr)).toEqual(10);
  });

  it('calculate the sums for empty array to 0', () => {
    const arr: number[] = [];
    expect(calculateSum(arr)).toEqual(0);
  });
});

describe('calculateAverage', () => {
  it('calculate the average for [1,2,3,4] to 2.5', () => {
    const arr = [1, 2, 3, 4];
    expect(calculateAverage(arr)).toBeCloseTo(2.5, 10e-10);
  });

  it('calculate the average for empty array to 0', () => {
    const arr: number[] = [];
    expect(calculateAverage(arr)).toEqual(0);
  });
});
