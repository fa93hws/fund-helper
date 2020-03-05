import { PGService } from 'services/database/pgservice';
import {
  EastMoneyService,
  NUM_ITEM_PER_PAGE,
} from 'services/eastmoney/eastmoney-service';
import { getNetValues } from 'utils/net-values';
import { SingleBar, Presets } from 'cli-progress';

const TABLE_NAME = 'fund_net_values';
export type NetValue = {
  date: Date;
  value: number;
};

export class FundNetValuesService {
  constructor(private readonly dbService: PGService) {}

  async writeToDB({
    fundId,
    netValues,
  }: {
    fundId: string;
    netValues: readonly NetValue[];
  }) {
    if (netValues.length === 0) {
      return 0;
    }
    const insertString = `INSERT INTO ${TABLE_NAME} (id, time, value) VALUES`;
    const queryStringBuffer = netValues.map(
      ({ value }, idx) => `('${fundId}', $${idx + 1}, '${value}')`,
    );
    const queryString = `${insertString +
      queryStringBuffer.join(',')} ON CONFLICT (id, time) DO NOTHING`;
    const res = await this.dbService.query(
      queryString,
      netValues.map(n => n.date),
    );
    return res.rowCount;
  }
}

// TODO Add unit test
export async function downloadAllValues({
  fundId,
  eastMoneyService,
}: {
  fundId: string;
  eastMoneyService: EastMoneyService;
}): Promise<NetValue[]> {
  const { pages } = await eastMoneyService.getNetValues({
    id: fundId,
    pageNum: 1,
  });
  if (pages === 0) {
    return [];
  }
  const bar = new SingleBar({}, Presets.shades_classic);
  bar.start(pages, 0);
  const fetchNetValues = (pageNum: number) =>
    eastMoneyService.getNetValues({ id: fundId, pageNum });
  const netValues = await getNetValues({
    // TODO Convert it to number of days is a bit hacky
    numDays: pages * NUM_ITEM_PER_PAGE,
    fetchNetValues,
    progressCallback: () => bar.increment(),
  });
  bar.stop();
  return netValues;
}
