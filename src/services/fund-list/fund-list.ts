import { yellow } from 'chalk';
import { PGService } from 'services/database/pgservice';
import { EastMoneyService } from 'services/eastmoney/eastmoney-service';

const TABLE_NAME = 'fund_info';

export type FundInfo = {
  name: string;
  type: string;
};

export class FundListService {
  constructor(private readonly dbService: PGService) {}

  async isEmpty() {
    const queryString = `SELECT COUNT(id) FROM ${TABLE_NAME}`;
    const res = await this.dbService.query<{ count: string }>(queryString);
    return res.rows[0].count === '0';
  }

  async writeToDB(list: Record<string, FundInfo>) {
    const insertString = `INSERT INTO ${TABLE_NAME} (id, name, type) VALUES`;
    const queryStringBuffer = Object.entries(list).map(
      ([id, info]) => `('${id}', '${info.name}', '${info.type}')`,
    );
    const queryString = `${insertString + queryStringBuffer.join(',')}`;
    const res = await this.dbService.query(queryString);
    return res.rowCount;
  }

  async findInfo(fundId: string) {
    const queryString = `SELECT name, type FROM ${TABLE_NAME} WHERE id = '${fundId}'`;
    const res = await this.dbService.query<FundInfo>(queryString);
    return res.rows[0];
  }
}

export async function maybeDownloadList({
  fundListService,
  eastMoneyService,
}: {
  fundListService: FundListService;
  eastMoneyService: EastMoneyService;
}) {
  if (!(await fundListService.isEmpty())) {
    return;
  }
  console.log(yellow('fund list is empty, downloading fund list'));
  const fundList = await eastMoneyService.getFundInfoList();
  await fundListService.writeToDB(fundList);
  console.log(
    yellow('fund list has been downloaded and added to the databases'),
  );
}
