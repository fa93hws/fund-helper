import { HttpService } from '../http/http';
import { FundValuesProto } from './fund-value.proto';
import { FundListProto } from './fund-list.proto';

export const NUM_ITEM_PER_PAGE = 20;

export class EastMoneyService {
  private readonly hostname = 'fund.eastmoney.com';

  constructor(private readonly httpService: HttpService) {
  }

  /**
   * @param param.id fund id
   * @param param.pageNum pagination parameter
   */
  async getNetValues({ id, pageNum }: {
    id: string;
    pageNum: number;
  }) {
    const queryParameters = `type=lsjz&code=${id}&page=${pageNum}&per=${NUM_ITEM_PER_PAGE}`
    const response = await this.httpService.sendHttpRequest({
      hostname: this.hostname,
      path: `/f10/F10DataApi.aspx?${queryParameters}`,
      method: 'GET',
    });
    const parsedHttpResponse = this.httpService.parseHttpResponse(response);
    if (parsedHttpResponse.kind === 'success') {
      return FundValuesProto.deserialize(parsedHttpResponse.body);
    } else {
      throw new Error(`failed to fetch net values for queryParameters: ${queryParameters}`);
    }
  }

  async getFundInfo(id: string) {
    const response = await this.httpService.sendHttpRequest({
      hostname: this.hostname,
      path: '/js/fundcode_search.js',
      method: 'GET',
    });
    const parsedHttpResponse = this.httpService.parseHttpResponse(response);
    if (parsedHttpResponse.kind === 'success') {
      const { fundList } = FundListProto.deserialize(parsedHttpResponse.body);
      if (fundList[id] != null) {
        return fundList[id]
      }
      throw new Error(`fundId ${id} does not match anything in the list`);
    } else {
      throw new Error(`failed to fetch fund list`);
    }
  }
}