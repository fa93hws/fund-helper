import { PersistCacheService } from '../../cache/persist-cache';
import { HttpService } from '../../http/http';
import { EastMoneyService } from '../eastmoney-service';
import { FundValuesProto } from '../fund-value.proto';
import { FundListProto } from '../fund-list.proto';

describe('EastMoneyService', () => {
  const sendHttpRequest = jest.fn();
  const parseHttpResponse = jest.fn();
  const httpService = ({
    sendHttpRequest,
    parseHttpResponse,
  } as any) as HttpService;
  const set = jest.fn();
  const get = jest.fn();
  const cacheService = ({
    set,
    get,
  } as any) as PersistCacheService;
  const eastMoneyService = new EastMoneyService(httpService, cacheService);
  FundListProto.deserialize = () => new FundListProto({});
  FundValuesProto.deserialize = () =>
    new FundValuesProto({ curPage: 1, records: 1, pages: 1, netValues: [] });

  afterEach(() => {
    sendHttpRequest.mockRestore();
    parseHttpResponse.mockRestore();
    set.mockRestore();
    get.mockRestore();
  });

  describe('getNetValues', () => {
    it('send requests to url that match string', async () => {
      parseHttpResponse.mockReturnValueOnce({ kind: 'success' });
      await eastMoneyService.getNetValues({ id: '123', pageNum: 2 });
      expect(sendHttpRequest).toHaveBeenCalledWith({
        hostname: 'fund.eastmoney.com',
        path: `/f10/F10DataApi.aspx?type=lsjz&code=123&page=2&per=20`,
        method: 'GET',
      });
    });

    it('throws if the http request fails', async () => {
      parseHttpResponse.mockReturnValueOnce({ kind: 'failed' });
      await expect(
        eastMoneyService.getNetValues({ id: '123', pageNum: 2 }),
      ).rejects.toMatchInlineSnapshot(
        `[Error: failed to fetch net values for queryParameters: type=lsjz&code=123&page=2&per=20]`,
      );
    });
  });

  describe('getFundInfoList', () => {
    it('use cache value if exists and valid', async () => {
      get.mockReturnValueOnce({ kind: 'success', result: { a: 1 } });
      await eastMoneyService.getFundInfoList();
      expect(get).toHaveBeenCalled();
      expect(sendHttpRequest).not.toHaveBeenCalled();
    });

    it('skip cache value if exists but not valid', async () => {
      get.mockReturnValueOnce({ kind: 'badCache', reason: 'I do not know' });
      parseHttpResponse.mockReturnValueOnce({ kind: 'success' });
      await eastMoneyService.getFundInfoList();
      expect(get).toHaveBeenCalled();
      expect(sendHttpRequest).toHaveBeenCalledWith({
        hostname: 'fund.eastmoney.com',
        path: '/js/fundcode_search.js',
        method: 'GET',
      });
    });

    it('skip cache value if exists but outdated', async () => {
      get.mockReturnValueOnce({ kind: 'outdated' });
      parseHttpResponse.mockReturnValueOnce({ kind: 'success' });
      await eastMoneyService.getFundInfoList();
      expect(get).toHaveBeenCalled();
      expect(sendHttpRequest).toHaveBeenCalledWith({
        hostname: 'fund.eastmoney.com',
        path: '/js/fundcode_search.js',
        method: 'GET',
      });
    });

    it('skip cache value if not found', async () => {
      get.mockReturnValueOnce({ kind: 'notFound' });
      parseHttpResponse.mockReturnValueOnce({ kind: 'success' });
      await eastMoneyService.getFundInfoList();
      expect(get).toHaveBeenCalled();
      expect(sendHttpRequest).toHaveBeenCalledWith({
        hostname: 'fund.eastmoney.com',
        path: '/js/fundcode_search.js',
        method: 'GET',
      });
    });

    it('throws for other cases', async () => {
      get.mockReturnValueOnce({ kind: 'guming' });
      parseHttpResponse.mockReturnValueOnce({ kind: 'success' });
      await expect(
        eastMoneyService.getFundInfoList(),
      ).rejects.toMatchInlineSnapshot(
        `[Error: unreachable case: {"kind":"guming"}]`,
      );
      expect(parseHttpResponse).not.toHaveBeenCalled();
    });

    it('throws if the request fails', async () => {
      get.mockReturnValueOnce({ kind: 'notFound' });
      parseHttpResponse.mockReturnValueOnce({ kind: 'failed' });
      await expect(
        eastMoneyService.getFundInfoList(),
      ).rejects.toMatchInlineSnapshot(`[Error: failed to fetch fund list]`);
    });

    it('write to cache if request success', async () => {
      get.mockReturnValueOnce({ kind: 'notFound' });
      parseHttpResponse.mockReturnValueOnce({ kind: 'success' });
      await eastMoneyService.getFundInfoList();
      expect(set).toHaveBeenCalled();
    });
  });
});
