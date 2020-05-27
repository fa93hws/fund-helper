import { HttpService } from '@nestjs/common';
import {
  fakeValueResponseRaw,
  fakeValueResponseParsed,
  fakeListResponseParsed,
  fakeListResponseRaw,
} from './fake-data';
import { EastMoneyService } from '../eastmoney.service';
import { of } from 'rxjs';

describe('EastMoneyService', () => {
  const fakeGet = jest.fn();
  const fakeHttpService: HttpService = { get: fakeGet } as any;
  const fakeService = new EastMoneyService(fakeHttpService);

  beforeEach(() => {
    fakeGet.mockRestore();
  });

  describe('getValues', () => {
    it('calls the corresponding api', async () => {
      fakeGet.mockReturnValue(
        of({
          status: 200,
          data: fakeValueResponseRaw,
        }),
      );
      await fakeService.getValues('id', 2).toPromise();
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
      const result = await fakeService.getValues('id', 2).toPromise();
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
      const result = await fakeService.getValues('id', 2).toPromise();
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
      const result = await fakeService.getValues('id', 2).toPromise();
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
