import * as Debug from 'debug';
import { HttpService } from '../http/http';
import { FundValuesProto } from './fund-value.proto';
import { FundListProto, FundInfo } from './fund-list.proto';
import { PersistCacheService } from '../cache/persist-cache';
import { UnreachableError } from '../../utils/error';

const debugClient = Debug('eastmoney-service');
const debug = debugClient.extend('debug');
const info = debugClient.extend('info');

export const NUM_ITEM_PER_PAGE = 20;
const CACHE_VERSION = '20200229';

export class EastMoneyService {
  private readonly hostname = 'fund.eastmoney.com';

  constructor(
    private readonly httpService: HttpService,
    private readonly persistCacheService: PersistCacheService,
  ) {}

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
    } else {
      throw new Error(
        `failed to fetch net values for queryParameters: ${queryParameters}`,
      );
    }
  }

  async getFundInfoList(): Promise<Record<string, FundInfo>> {
    const cacheKey = 'eastmoney/fundlist';
    const cacheResult = this.persistCacheService.get({
      key: cacheKey,
      age: 24 * 3600 * 1000,
      version: CACHE_VERSION,
    });
    switch (cacheResult.kind) {
      case 'success':
        debug('cache for fundInfoList found');
        return cacheResult.result as Record<string, FundInfo>;
      case 'badCache':
        debug(
          'cache for fundInfoList found, but format is not correct, reason: ',
          cacheResult.reason,
        );
        break;
      case 'notFound':
        debug('cache for fundInfoList not found');
        break;
      case 'outdated':
        debug('cache for fundInfoList found, but it is outdated');
        break;
      default:
        throw new UnreachableError(cacheResult);
    }

    const response = await this.httpService.sendHttpRequest({
      hostname: this.hostname,
      path: '/js/fundcode_search.js',
      method: 'GET',
    });
    const parsedHttpResponse = this.httpService.parseHttpResponse(response);
    if (parsedHttpResponse.kind === 'success') {
      const { fundList } = FundListProto.deserialize(parsedHttpResponse.body);
      this.persistCacheService.set({
        key: cacheKey,
        value: fundList,
        version: CACHE_VERSION,
      });
      return fundList;
    } else {
      throw new Error(`failed to fetch fund list`);
    }
  }
}
