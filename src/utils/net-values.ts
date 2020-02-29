import * as Debug from 'debug';
import { NUM_ITEM_PER_PAGE } from '../services/eastmoney/eastmoney-service';
import { NetValue } from '../analyze/analyze';

const debug = Debug('net-values').extend('debug');

export function getNetValues({
  numDays,
  fetchNetValues,
}: {
  numDays: number;
  fetchNetValues: (pageNum: number) => Promise<{ netValues: NetValue[] }>;
}): Promise<NetValue[]> {
  const numPromises = Math.ceil(numDays / NUM_ITEM_PER_PAGE);
  const pageIdx = Array.from(new Array(numPromises), (_, idx) => idx + 1);
  const promises = pageIdx.reverse().map(fetchNetValues);
  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then(data => {
        const values = data.map(d => d.netValues);
        const out = ([] as NetValue[]).concat(...values).slice(-numDays);
        debug(out);
        resolve(out);
      })
      .catch(reject);
  });
}
