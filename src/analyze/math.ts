export const calculateSum = (data: readonly number[]) =>
  data.reduce((acc, cur) => acc + cur, 0);
export const calculateAverage = (data: readonly number[]) =>
  data.length === 0 ? 0 : calculateSum(data) / data.length;
