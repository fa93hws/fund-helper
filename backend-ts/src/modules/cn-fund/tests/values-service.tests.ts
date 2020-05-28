import { of } from 'rxjs';
import type { EastMoneyService } from '../eastmoney/eastmoney.service';
import type { PGService } from '../../../services/database/pg.service';
import { FundValueService } from '../values.service';

describe('valuesService', () => {
  const fakeEastMoneyGetList = jest.fn();
  const fakeEastMoneyGetValues = jest.fn();

  const fakeEastMoneyService = ({
    getList: fakeEastMoneyGetList,
    getValues: fakeEastMoneyGetValues,
  } as any) as EastMoneyService;

  const fakePgInsert = jest.fn();
  const fakePgSelect = jest.fn();
  const pgService = ({
    insert: fakePgInsert,
    select: fakePgSelect,
  } as any) as PGService;
  const fakeService = new FundValueService(fakeEastMoneyService, pgService);

  beforeEach(() => {
    fakeEastMoneyGetValues.mockRestore();
    fakeEastMoneyGetList.mockRestore();
    fakePgInsert.mockRestore();
    fakePgSelect.mockRestore();
  });

  describe('getList', () => {
    it('update db with result from east money service', async (done) => {
      fakeEastMoneyGetList.mockReturnValueOnce(
        of({
          kind: 'ok',
          data: [
            { id: '123', name: 'fund-name', type: 'A' },
            { id: '12', name: 'fund', type: 'B' },
          ],
        }),
      );
      fakePgInsert.mockReturnValue({ kind: 'ok' });
      const result = await fakeService.getList();
      if (result.kind === 'ok') {
        expect(result.data).toEqual([
          { id: '123', name: 'fund-name', type: 'A' },
          { id: '12', name: 'fund', type: 'B' },
        ]);
        expect(fakePgInsert).toBeCalledWith(
          {
            fields: ['id', 'name', 'type'],
            tableName: 'fund_info',
            values: [
              ['$1', '$2', '$3'],
              ['$4', '$5', '$6'],
            ],
            conflict: {
              field: 'id',
              set: [
                {
                  field: 'name',
                  value: 'EXCLUDED.name',
                },
                {
                  field: 'type',
                  value: 'EXCLUDED.type',
                },
              ],
            },
          },
          ['123', 'fund-name', 'A', '12', 'fund', 'B'],
        );
        done();
      } else {
        done.fail('it should not fail');
      }
    });
    it('returns error if request fails', async () => {
      fakeEastMoneyGetList.mockReturnValueOnce(
        of({
          kind: 'error',
          error: 'error!',
        }),
      );
      const result = await fakeService.getList();
      expect(result).toEqual({
        kind: 'error',
        error: 'error!',
      });
      expect(fakePgInsert).not.toBeCalled();
    });
    it('returns error if update fails', async () => {
      fakeEastMoneyGetList.mockReturnValueOnce(
        of({
          kind: 'ok',
          data: [{ id: '123', name: 'fund-name', type: 'A' }],
        }),
      );
      fakePgInsert.mockReturnValue({ kind: 'error', error: 'error!' });
      const result = await fakeService.getList();
      expect(result).toEqual({
        kind: 'error',
        error: 'error!',
      });
    });
  });

  describe('getValues', () => {
    it('returns values if there is only one page', async () => {
      fakeEastMoneyGetValues.mockReturnValueOnce(
        of({
          kind: 'ok',
          data: {
            values: [{ date: 1, value: 1.23 }],
            pages: 1,
          },
        }),
      );
      const values = await fakeService.getValues('id');
      expect(fakeEastMoneyGetValues).toBeCalledWith('id', 1);
      expect(values).toEqual({
        kind: 'ok',
        data: [{ date: 1, value: 1.23 }],
      });
    });

    it('returns values directly if there is only one page', async () => {
      fakeEastMoneyGetValues.mockReturnValueOnce(
        of({
          kind: 'ok',
          data: {
            values: [{ date: 1, value: 1.23 }],
            pages: 1,
          },
        }),
      );
      const values = await fakeService.getValues('id');
      expect(fakeEastMoneyGetValues).toBeCalledWith('id', 1);
      expect(values).toEqual({
        kind: 'ok',
        data: [{ date: 1, value: 1.23 }],
      });
    });

    it('accumulates values from all pages', async () => {
      fakeEastMoneyGetValues.mockImplementation((id: string, page: number) =>
        of({
          kind: 'ok',
          data: {
            values: [
              { date: page, value: 2 * page },
              { date: page * 2, value: 4 * page },
            ],
            pages: 3,
          },
        }),
      );
      const values = await fakeService.getValues('id');
      expect(fakeEastMoneyGetValues).toHaveBeenNthCalledWith(1, 'id', 1);
      expect(fakeEastMoneyGetValues).toHaveBeenNthCalledWith(2, 'id', 2);
      expect(fakeEastMoneyGetValues).toHaveBeenNthCalledWith(3, 'id', 3);
      expect(values).toEqual({
        kind: 'ok',
        data: [
          { date: 1, value: 2 },
          { date: 2, value: 4 },
          { date: 2, value: 4 },
          { date: 4, value: 8 },
          { date: 3, value: 6 },
          { date: 6, value: 12 },
        ],
      });
    });

    it('returns error if any of the request fails', async () => {
      fakeEastMoneyGetValues.mockImplementation((id: string, page: number) => {
        if (page === 2) {
          return of({
            kind: 'error',
            error: 'err',
          });
        }
        return of({
          kind: 'ok',
          data: {
            values: [{ date: 1, value: 1.23 }],
            pages: 4,
          },
        });
      });
      const values = await fakeService.getValues('id');
      expect(fakeEastMoneyGetValues).toHaveBeenNthCalledWith(1, 'id', 1);
      expect(fakeEastMoneyGetValues).toHaveBeenNthCalledWith(2, 'id', 2);
      expect(fakeEastMoneyGetValues).toHaveBeenNthCalledWith(3, 'id', 3);
      expect(fakeEastMoneyGetValues).toHaveBeenNthCalledWith(4, 'id', 4);
      expect(values).toEqual({
        kind: 'error',
        error: 'err',
      });
    });
  });

  describe('getFundInfo', () => {
    it('return info directly without send request if it is in the DB', async () => {
      fakePgSelect.mockReturnValue({
        kind: 'ok',
        data: {
          rowCount: 1,
          rows: [{ id: '123', name: 'fund-name', type: 'type' }],
        },
      });
      const result = await fakeService.getFundInfo('123');
      expect(result).toEqual({
        kind: 'ok',
        data: { id: '123', name: 'fund-name', type: 'type' },
      });
      expect(fakePgSelect).toBeCalledWith(
        {
          fields: ['id', 'name', 'type'],
          tableName: 'fund_info',
          where: 'id = $1',
        },
        ['123'],
      );
    });
    it('sends the request and update DB if not found in the db at the first time', async () => {
      fakePgSelect.mockReturnValueOnce({
        kind: 'ok',
        data: {
          rowCount: 0,
          rows: [],
        },
      });
      fakePgSelect.mockReturnValueOnce({
        kind: 'ok',
        data: {
          rowCount: 1,
          rows: [{ id: '123', name: 'fund-name', type: 'type' }],
        },
      });
      fakePgInsert.mockReturnValue({ kind: 'ok' });
      fakeEastMoneyGetList.mockReturnValue(
        of({
          kind: 'ok',
          data: [],
        }),
      );
      const result = await fakeService.getFundInfo('123');
      expect(result).toEqual({
        kind: 'ok',
        data: { id: '123', name: 'fund-name', type: 'type' },
      });
      expect(fakePgSelect).toBeCalledTimes(2);
      expect(fakeEastMoneyGetList).toBeCalled();
      expect(fakePgInsert).toBeCalled();
    });
    it('returns error if not found in second trial', async (done) => {
      fakePgSelect.mockReturnValue({
        kind: 'ok',
        data: {
          rowCount: 0,
          rows: [],
        },
      });
      fakePgInsert.mockReturnValue({ kind: 'ok' });
      fakeEastMoneyGetList.mockReturnValue(
        of({
          kind: 'ok',
          data: [],
        }),
      );
      const result = await fakeService.getFundInfo('123');
      if (result.kind === 'error') {
        expect(fakePgSelect).toBeCalledTimes(2);
        expect(fakeEastMoneyGetList).toBeCalled();
        expect(fakePgInsert).toBeCalled();
        expect(result.error).toMatchInlineSnapshot(
          `[Error: 0 or multiple results found for fundId=123]`,
        );
        done();
      } else {
        done.fail('it should fail');
      }
    });
  });
});
