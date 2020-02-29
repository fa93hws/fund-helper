import * as Debug from 'debug';
import {
  EastMoneyService,
  NUM_ITEM_PER_PAGE,
} from '../services/eastmoney/eastmoney-service';
import { NetValue } from '../analyze/analyze';

const debug = Debug('net-values').extend('debug');

export function getNetValues({
  eastMoneyService,
  numDays,
  fundId,
}: {
  eastMoneyService: EastMoneyService;
  numDays: number;
  fundId: string;
}): Promise<NetValue[]> {
  const numPromises = Math.ceil(numDays / NUM_ITEM_PER_PAGE);
  const pageIdx = Array.from(new Array(numPromises), (_, idx) => idx + 1);
  const promises = pageIdx
    .reverse()
    .map(idx => eastMoneyService.getNetValues({ id: fundId, pageNum: idx }));
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
