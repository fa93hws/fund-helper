import { HttpService } from '@nestjs/common';
import {
  fakeValueResponseRaw,
  fakeValueResponseParsed,
  fakeListResponseParsed,
  fakeListResponseRaw,
} from './fake-data';
import { EastMoneyService } from '../eastmoney.service';
import { fakeBunyanLogService } from '../../../log/fake-bunyan.service';
import { of } from 'rxjs';

describe('EastMoneyService', () => {
  const fakeGet = jest.fn();
  const fakeHttpService: HttpService = { get: fakeGet } as any;
  const fakeService = new EastMoneyService(
    fakeHttpService,
    fakeBunyanLogService,
  );

  beforeEach(() => {
    fakeGet.mockRestore();
  });

  describe('getValueAtPage', () => {
    it('calls the corresponding api', async () => {
      fakeGet.mockReturnValue(
        of({
          status: 200,
          data: fakeValueResponseRaw,
        }),
      );
      await fakeService.getValueAtPage('id', 2).toPromise();
      expect(fakeGet).toBeCalledWith(
        'http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=id&page=2&per=20',
      );
    });

    it('get and deserialize the response', async () => {
      fakeGet.mockReturnValue(
        of({
          status: 200,
          data: fakeValueResponseRaw,
        }),
      );
      const result = await fakeService.getValueAtPage('id', 2).toPromise();
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
      const result = await fakeService.getValueAtPage('id', 2).toPromise();
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
      const result = await fakeService.getValueAtPage('id', 2).toPromise();
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
      const values = await fakeService.getValues('id');
      expect(fakeEastMoneyGetValueAtPage).toBeCalledWith('id', 1);
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
      const values = await fakeService.getValues('id');
      expect(fakeEastMoneyGetValueAtPage).toBeCalledWith('id', 1);
      expect(values).toEqual({
        kind: 'ok',
        data: [{ date: 1, value: 1.23 }],
      });
    });

    it('accumulates values from all pages', async () => {
      fakeEastMoneyGetValueAtPage.mockImplementation(
        (id: string, page: number) =>
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
      expect(fakeEastMoneyGetValueAtPage).toHaveBeenNthCalledWith(1, 'id', 1);
      expect(fakeEastMoneyGetValueAtPage).toHaveBeenNthCalledWith(2, 'id', 2);
      expect(fakeEastMoneyGetValueAtPage).toHaveBeenNthCalledWith(3, 'id', 3);
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
      fakeEastMoneyGetValueAtPage.mockImplementation(
        (id: string, page: number) => {
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
        },
      );
      const values = await fakeService.getValues('id');
      expect(fakeEastMoneyGetValueAtPage).toHaveBeenNthCalledWith(1, 'id', 1);
      expect(fakeEastMoneyGetValueAtPage).toHaveBeenNthCalledWith(2, 'id', 2);
      expect(fakeEastMoneyGetValueAtPage).toHaveBeenNthCalledWith(3, 'id', 3);
      expect(fakeEastMoneyGetValueAtPage).toHaveBeenNthCalledWith(4, 'id', 4);
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
