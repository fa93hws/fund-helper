export const calculateSum = (data: readonly number[]) =>
  data.reduce((acc, cur) => acc + cur);
export const calculateAverage = (data: readonly number[]) =>
  calculateSum(data) / data.length;
