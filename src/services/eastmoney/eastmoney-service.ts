import { HttpService } from '../http/http';
import { FundValuesProto } from './fund-value.proto';
import { FundListProto } from './fund-list.proto';
import { FundInfo } from '../fund-list/fund-list';

export const NUM_ITEM_PER_PAGE = 20;

export class EastMoneyService {
  private readonly hostname = 'fund.eastmoney.com';

  constructor(private readonly httpService: HttpService) {}

  /**
   * @param param.id fund id
   * @param param.pageNum pagination parameter
   */
  async getNetValues({ id, pageNum }: { id: string; pageNum: number }) {
    const queryParameters = `type=lsjz&code=${id}&page=${pageNum}&per=${NUM_ITEM_PER_PAGE}`;
    const response = await this.httpService.sendHttpRequest({
      hostname: this.hostname,
      path: `/f10/F10DataApi.aspx?${queryParameters}`,
      method: 'GET',
    });
    const parsedHttpResponse = this.httpService.parseHttpResponse(response);
    if (parsedHttpResponse.kind === 'success') {
      return FundValuesProto.deserialize(parsedHttpResponse.body);
    }
    throw new Error(
      `failed to fetch net values for queryParameters: ${queryParameters}`,
    );
  }

  async getFundInfoList(): Promise<Record<string, FundInfo>> {
    const response = await this.httpService.sendHttpRequest({
      hostname: this.hostname,
      path: '/js/fundcode_search.js',
      method: 'GET',
    });
    const parsedHttpResponse = this.httpService.parseHttpResponse(response);
    if (parsedHttpResponse.kind === 'success') {
      const { fundList } = FundListProto.deserialize(parsedHttpResponse.body);
      return fundList;
    }
    throw new Error(`failed to fetch fund list`);
  }
}
