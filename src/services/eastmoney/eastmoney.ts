import { HttpService } from '../http/http';
import { EastMoneyProto } from './eastmoney.proto';

export const NUM_ITEM_PER_PAGE = 20;

export class EastMoneyService {
  private readonly hostname = 'fund.eastmoney.com';
  private readonly pathPrefix = '/f10/F10DataApi.aspx'

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
      path: `${this.pathPrefix}?${queryParameters}`,
      method: 'GET',
    });
    const parsedHttpResponse = this.httpService.parseHttpResponse(response);
    if (parsedHttpResponse.kind === 'success') {
      return EastMoneyProto.deserialize(parsedHttpResponse.body);
    } else {
      throw new Error(`failed to fetch net values for queryParameters: ${queryParameters}`);
    }
  }
}