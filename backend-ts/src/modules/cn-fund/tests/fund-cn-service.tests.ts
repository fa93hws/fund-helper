import { of } from 'rxjs';
import type { EastMoneyService } from '../eastmoney/eastmoney.service';
import type { PGService } from '../../database/pg.service';
import { fakeBunyanLogService } from '../../log/fake/fake-bunyan.service';
import { FundCNService } from '../fund-cn.service';

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
  const fakeService = new FundCNService(
    fakeEastMoneyService,
    pgService,
    fakeBunyanLogService,
  );

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
            tableName: 'cn_fund_infos',
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
          tableName: 'cn_fund_infos',
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
        expect(result.error).toEqual('NOT_FOUND');
        done();
      } else {
        done.fail('it should fail');
      }
    });
  });
});
