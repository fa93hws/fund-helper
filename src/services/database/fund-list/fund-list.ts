import { PGService } from '../pgservice';

const TABLE_NAME = 'fund_info';

export type FundInfo = {
  abbr: string;
  name: string;
  type: string;
  pinyin: string;
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
    const queryString = `${insertString + queryStringBuffer.join(',')};`;
    const res = await this.dbService.query(queryString);
    return res.rowCount;
  }
}
