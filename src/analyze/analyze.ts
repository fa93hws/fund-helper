import { calculateAverage } from './math';

export type NetValue = {
  // javascript timestamp
  date: Date;
  value: number;
};

export function calculateBasics(data: readonly NetValue[]) {
  const values = data.map(d => d.value);
  const average = parseFloat(calculateAverage(values).toFixed(4));
  return {
    max: Math.max(...values),
    min: Math.min(...values),
    average,
  };
}
