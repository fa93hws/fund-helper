import { NetValue } from 'services/fund-net-values/fund-net-values';
import { calculateAverage } from './math';

export function calculateBasics(data: readonly NetValue[]) {
  if (data.length === 0) {
    throw new Error('data can not be empty');
  }
  const values = data.map(d => d.value);
  const average = parseFloat(calculateAverage(values).toFixed(4));
  return {
    max: Math.max(...values),
    min: Math.min(...values),
    average,
  };
}
