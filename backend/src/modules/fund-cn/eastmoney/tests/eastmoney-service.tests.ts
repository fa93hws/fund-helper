import { HttpService } from '@nestjs/common';
import {
  fakeValueResponseRaw,
  fakeValueResponseParsed,
  fakeListResponseParsed,
  fakeListResponseRaw,
} from './fake-data';
import { EastMoneyService } from '../eastmoney.service';
import { fakeBunyanLogService } from '../../../log/fake/fake-bunyan.service';
import { of } from 'rxjs';

describe('EastMoneyService', () => {
  const fakeGet = jest.fn();
  const fakeHttpService: HttpService = { get: fakeGet } as any;
  const fakeService = new EastMoneyService(
    fakeHttpService,
    fakeBunyanLogService,
  );

  describe('getValueAtPage', () => {
    beforeEach(() => {
      fakeGet.mockRestore();
    });

    it('calls the corresponding api', async () => {
      fakeGet.mockReturnValue(
        of({
          status: 200,
          data: fakeValueResponseRaw,
        }),
      );
      await fakeService
        .getValueAtPage({ fundId: 'id', page: 2, startDate: 'start-date' })
        .toPromise();
      expect(fakeGet).toBeCalledWith(
        'http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=id&page=2&per=20&sdate=start-date',
      );
    });

    it('get and deserialize the response', async () => {
      fakeGet.mockReturnValue(
        of({
          status: 200,
          data: fakeValueResponseRaw,
        }),
      );
      const result = await fakeService
        .getValueAtPage({ fundId: 'id', page: 2, startDate: 'start-date' })
        .toPromise();
      expect(result).toEqual({
        kind: 'ok',
        data: fakeValueResponseParsed,
      });
    });

    it('returns error if response is wrong', async (done) => {
      fakeGet.mockReturnValue(
        of({
          status: 200,
          data: 'var a = {}',
        }),
      );
      const result = await fakeService
        .getValueAtPage({ fundId: 'id', page: 2, startDate: 'start-date' })
        .toPromise();
      if (result.kind === 'error') {
        expect(result.error).toMatchInlineSnapshot(
          `[Error: Failed to get apidata.content as string]`,
        );
        done();
      } else {
        done.fail('it should fail');
      }
    });

    it('returns error if status is not 2xx', async () => {
      fakeGet.mockReturnValue(
        of({
          status: 500,
          statusText: 'service unavailable',
          data: 'wrong!',
        }),
      );
      const result = await fakeService
        .getValueAtPage({ fundId: 'id', page: 2, startDate: 'start-date' })
        .toPromise();
      expect(result).toEqual({
        kind: 'error',
        error: {
          statusCode: 500,
          statusText: 'service unavailable',
          error: 'wrong!',
        },
      });
    });
  });

  describe('getValues', () => {
    const fakeEastMoneyGetValueAtPage = jest.fn();
    const fakeService = new EastMoneyService(
      fakeHttpService,
      fakeBunyanLogService,
    );
    fakeService.getValueAtPage = fakeEastMoneyGetValueAtPage;

    beforeEach(() => {
      fakeGet.mockRestore();
      fakeEastMoneyGetValueAtPage.mockRestore();
    });

    it('returns values if there is only one page', async () => {
      fakeEastMoneyGetValueAtPage.mockReturnValueOnce(
        of({
          kind: 'ok',
          data: {
            values: [{ date: 1, value: 1.23 }],
            pages: 1,
          },
        }),
      );
      const values = await fakeService.getValues({
        fundId: 'id',
        startDate: 'start-date',
      });
      expect(fakeEastMoneyGetValueAtPage).toBeCalledWith({
        fundId: 'id',
        page: 1,
        startDate: 'start-date',
      });
      expect(values).toEqual({
        kind: 'ok',
        data: [{ date: 1, value: 1.23 }],
      });
    });

    it('returns values directly if there is only one page', async () => {
      fakeEastMoneyGetValueAtPage.mockReturnValueOnce(
        of({
          kind: 'ok',
          data: {
            values: [{ date: 1, value: 1.23 }],
            pages: 1,
          },
        }),
      );
      const values = await fakeService.getValues({
        fundId: 'id',
        startDate: 'start-date',
      });
      expect(fakeEastMoneyGetValueAtPage).toBeCalledWith({
        fundId: 'id',
        page: 1,
        startDate: 'start-date',
      });
      expect(values).toEqual({
        kind: 'ok',
        data: [{ date: 1, value: 1.23 }],
      });
    });

    it('accumulates values from all pages', async () => {
      fakeEastMoneyGetValueAtPage.mockImplementation(
        ({ page }: { page: number }) =>
          of({
            kind: 'ok',
            data: {
              values: [
                { time: page, value: 2 * page },
                { time: page * 2, value: 4 * page },
              ],
              pages: 3,
            },
          }),
      );
      const values = await fakeService.getValues({
        fundId: 'id',
        startDate: 'start-date',
      });
      expect(fakeEastMoneyGetValueAtPage).toHaveBeenNthCalledWith(1, {
        fundId: 'id',
        page: 1,
        startDate: 'start-date',
      });
      expect(fakeEastMoneyGetValueAtPage).toHaveBeenNthCalledWith(2, {
        fundId: 'id',
        page: 2,
        startDate: 'start-date',
      });
      expect(fakeEastMoneyGetValueAtPage).toHaveBeenNthCalledWith(3, {
        fundId: 'id',
        page: 3,
        startDate: 'start-date',
      });
      expect(values).toEqual({
        kind: 'ok',
        data: [
          { time: 1, value: 2 },
          { time: 2, value: 4 },
          { time: 2, value: 4 },
          { time: 4, value: 8 },
          { time: 3, value: 6 },
          { time: 6, value: 12 },
        ],
      });
    });

    it('returns error if any of the request fails', async () => {
      fakeEastMoneyGetValueAtPage.mockImplementation(
        ({ page }: { page: number }) => {
          if (page === 2) {
            return of({
              kind: 'error',
              error: 'err',
            });
          }
          return of({
            kind: 'ok',
            data: {
              values: [{ time: 1, value: 1.23 }],
              pages: 4,
            },
          });
        },
      );
      const values = await fakeService.getValues({
        fundId: 'id',
        startDate: 'start-date',
      });
      expect(fakeEastMoneyGetValueAtPage).toHaveBeenNthCalledWith(1, {
        fundId: 'id',
        page: 1,
        startDate: 'start-date',
      });
      expect(fakeEastMoneyGetValueAtPage).toHaveBeenNthCalledWith(2, {
        fundId: 'id',
        page: 2,
        startDate: 'start-date',
      });
      expect(fakeEastMoneyGetValueAtPage).toHaveBeenNthCalledWith(3, {
        fundId: 'id',
        page: 3,
        startDate: 'start-date',
      });
      expect(fakeEastMoneyGetValueAtPage).toHaveBeenNthCalledWith(4, {
        fundId: 'id',
        page: 4,
        startDate: 'start-date',
      });
      expect(values).toEqual({
        kind: 'error',
        error: 'err',
      });
    });
  });

  describe('getList', () => {
    it('calls the corresponding api', async () => {
      fakeGet.mockReturnValue(
        of({
          status: 200,
          data: fakeListResponseRaw,
        }),
      );
      await fakeService.getList().toPromise();
      expect(fakeGet).toBeCalledWith(
        'http://fund.eastmoney.com/js/fundcode_search.js',
      );
    });

    it('get and deserialize the response', async () => {
      fakeGet.mockReturnValue(
        of({
          status: 200,
          data: fakeListResponseRaw,
        }),
      );
      const result = await fakeService.getList().toPromise();
      expect(result).toEqual({
        kind: 'ok',
        data: fakeListResponseParsed,
      });
    });

    it('returns error if response is wrong', async (done) => {
      fakeGet.mockReturnValue(
        of({
          status: 200,
          data: 'var a = {}',
        }),
      );
      const result = await fakeService.getList().toPromise();
      if (result.kind === 'error') {
        expect(result.error).toMatchInlineSnapshot(
          `[Error: Failed to get r in context as array]`,
        );
        done();
      } else {
        done.fail('it should fail');
      }
    });

    it('returns error if status code is not 2xx', async () => {
      fakeGet.mockReturnValue(
        of({
          status: 302,
          statusText: 'there is an error',
          data: 'the error!',
        }),
      );
      const result = await fakeService.getList().toPromise();
      expect(result).toEqual({
        kind: 'error',
        error: {
          statusCode: 302,
          statusText: 'there is an error',
          error: 'the error!',
        },
      });
    });
  });
});
