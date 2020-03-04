import { PGService } from 'services/database/pgservice';
import { FundNetValuesService } from '../fund-net-values';

describe('FundNetValuesService', () => {
  const query = jest.fn();
  const dbService = ({ query } as any) as PGService;
  const fundNetValuesService = new FundNetValuesService(dbService);

  beforeEach(() => {
    query.mockReset();
  });

  it('is the query to write one fund net value to db', async () => {
    query.mockReturnValueOnce({ rowCount: 1 });
    const rowCount = await fundNetValuesService.writeToDB({
      fundId: '01',
      netValues: [{ date: new Date('1999-02-04'), value: 1.8 }],
    });
    expect(
      query,
    ).toHaveBeenCalledWith(
      `INSERT INTO fund_net_values (id, time, value) VALUES('01', $1, '1.8') ON CONFLICT (id, time) DO NOTHING`,
      [new Date('1999-02-04')],
    );
    expect(rowCount).toBe(1);
  });

  it('is the query to write two fund infos to db', async () => {
    query.mockReturnValueOnce({ rowCount: 2 });
    const rowCount = await fundNetValuesService.writeToDB({
      fundId: '01',
      netValues: [
        { date: new Date('1999-02-04'), value: 1.8 },
        { date: new Date('1989-09-12'), value: 2.8 },
      ],
    });
    expect(
      query,
    ).toHaveBeenCalledWith(
      `INSERT INTO fund_net_values (id, time, value) VALUES('01', $1, '1.8'),('01', $2, '2.8') ON CONFLICT (id, time) DO NOTHING`,
      [new Date('1999-02-04'), new Date('1989-09-12')],
    );
    expect(rowCount).toBe(2);
  });
});
