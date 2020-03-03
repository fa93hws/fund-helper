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
  const eastMoneyService = new EastMoneyService(httpService);
  FundListProto.deserialize = () => new FundListProto({});
  FundValuesProto.deserialize = () =>
    new FundValuesProto({ curPage: 1, records: 1, pages: 1, netValues: [] });

  afterEach(() => {
    sendHttpRequest.mockRestore();
    parseHttpResponse.mockRestore();
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
    it('throws if the request fails', async () => {
      parseHttpResponse.mockReturnValueOnce({ kind: 'failed' });
      await expect(
        eastMoneyService.getFundInfoList(),
      ).rejects.toMatchInlineSnapshot(`[Error: failed to fetch fund list]`);
    });

    it('resolves the list if request success', async () => {
      parseHttpResponse.mockReturnValueOnce({ kind: 'success' });
      const list = await eastMoneyService.getFundInfoList();
      expect(list).toEqual(new FundListProto({}).fundList);
    });
  });
});
