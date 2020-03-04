import * as Debug from 'debug';
import { NUM_ITEM_PER_PAGE } from 'services/eastmoney/eastmoney-service';
import { NetValue } from 'services/fund-net-values/fund-net-values';

const debug = Debug('net-values').extend('debug');

type ProgressCallback = ({
  completeIdx,
  total,
}: {
  completeIdx: number;
  total: number;
}) => void;

// TODO Move this function to a better place
export function getNetValues({
  numDays,
  fetchNetValues,
  progressCallback,
}: {
  numDays: number;
  progressCallback?: ProgressCallback;
  fetchNetValues: (pageNum: number) => Promise<{ netValues: NetValue[] }>;
}): Promise<NetValue[]> {
  const numPromises = Math.ceil(numDays / NUM_ITEM_PER_PAGE);
  const pageIdx = Array.from(new Array(numPromises), (_, idx) => idx + 1);
  // TODO Beautifize this monster function
  const promises = pageIdx.reverse().map(
    idx =>
      new Promise<{ netValues: NetValue[] }>(resolve => {
        fetchNetValues(idx).then(res => {
          if (progressCallback != null) {
            progressCallback({ completeIdx: idx, total: numPromises });
          }
          resolve(res);
        });
      }),
  );
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
