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

  const pgService = ({} as any) as PGService;
  const fakeService = new FundValueService(fakeEastMoneyService, pgService);

  beforeEach(() => {
    fakeEastMoneyGetValues.mockRestore();
    fakeEastMoneyGetList.mockRestore();
  });

  describe('getList', () => {
    it('forward to east money service', async () => {
      fakeEastMoneyGetList.mockReturnValueOnce(of());
      await fakeService.getList();
      expect(fakeEastMoneyGetList).toBeCalledTimes(1);
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
});
