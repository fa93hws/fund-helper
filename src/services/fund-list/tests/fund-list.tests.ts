import { PGService } from 'services/database/pgservice';
import { FundListService } from '../fund-list';

describe('FundListService', () => {
  const query = jest.fn();
  const dbService = ({ query } as any) as PGService;
  const fundListService = new FundListService(dbService);

  beforeEach(() => {
    query.mockReset();
  });

  it('is the query string of the isEmpty', async () => {
    query.mockReturnValueOnce({ rows: [{ count: '0' }] });
    await fundListService.isEmpty();
    expect(query).toHaveBeenCalledWith('SELECT COUNT(id) FROM fund_info');
  });

  it('is empty if no rows are found', async () => {
    query.mockReturnValueOnce({ rows: [{ count: '0' }] });
    const isEmpty = await fundListService.isEmpty();
    expect(isEmpty).toBe(true);
  });

  it('is not empty if any row are found', async () => {
    query.mockReturnValueOnce({ rows: [{ count: '1' }] });
    const isEmpty = await fundListService.isEmpty();
    expect(isEmpty).toBe(false);
  });

  it('is the query to write one fund info to db', async () => {
    query.mockReturnValueOnce({ rowCount: 1 });
    const rowCount = await fundListService.writeToDB({
      '01': { name: 'name', type: 'type' },
    });
    expect(query).toHaveBeenCalledWith(
      `INSERT INTO fund_info (id, name, type) VALUES('01', 'name', 'type')`,
    );
    expect(rowCount).toBe(1);
  });

  it('is the query to write two fund infos to db', async () => {
    query.mockReturnValueOnce({ rowCount: 1 });
    const rowCount = await fundListService.writeToDB({
      '01': { name: 'name', type: 'type' },
      '1001': { name: 'guming', type: 'cwx' },
    });
    expect(query).toHaveBeenCalledWith(
      `INSERT INTO fund_info (id, name, type) VALUES('1001', 'guming', 'cwx'),('01', 'name', 'type')`,
    );
    expect(rowCount).toBe(1);
  });

  it('is the query string for find info', async () => {
    query.mockReturnValueOnce({ rows: [{ name: 'guming', type: 'cwx' }] });
    const res = await fundListService.findInfo('0204');
    expect(query).toHaveBeenCalledWith(
      "SELECT name, type FROM fund_info WHERE id = '0204'",
    );
    expect(res).toEqual({ name: 'guming', type: 'cwx' });
  });

  it('return undefined if not found', async () => {
    query.mockReturnValueOnce({ rows: [] });
    const res = await fundListService.findInfo('0204');
    expect(query).toHaveBeenCalledWith(
      "SELECT name, type FROM fund_info WHERE id = '0204'",
    );
    expect(res).toEqual(undefined);
  });
});
