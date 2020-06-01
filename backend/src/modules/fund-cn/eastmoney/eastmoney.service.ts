import { AxiosResponse } from 'axios';
import { Injectable, HttpService } from '@nestjs/common';
import { of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Result } from '../../../utils/result-type';
import { transformResponse } from '../../../utils/http-result';
import {
  deserializeValue,
  deserializeList,
  FundValueResponse,
} from './deserialize-response';
import { BunyanLogService } from '../../log/bunyan.service';
import type {
  FundBasicInfoCN,
  FundValueCN,
} from '../../../protos/fund-cn.proto';
import { runInPool } from '../../../utils/promise-pool';

@Injectable()
export class EastMoneyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logService: BunyanLogService,
  ) {}

  private maybeFilterResponseError<R>(
    response: AxiosResponse<any>,
    deserializer: (data: any) => Result.T<R>,
  ): Result.T<R, any> {
    const dataResult = transformResponse(response);
    if (dataResult.kind === 'error') {
      return dataResult;
    }
    return deserializer(dataResult.data);
  }

  private handleRequestException(e: any) {
    return of(
      Result.createError({
        statusCode: -1,
        statusText: 'Did not get response from the backend server',
        error: e,
      }),
    );
  }

  getValueAtPage({
    fundId,
    page,
    startDate,
  }: {
    fundId: string;
    page: number;
    // YYYY-MM-DD
    startDate: string;
  }): Observable<Result.T<FundValueResponse, any>> {
    const url = `http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=${fundId}&page=${page}&per=20&sdate=${startDate}`;
    this.logService.info('fetching fund values from remote', { url });
    return this.httpService.get(url).pipe(
      map((response) =>
        this.maybeFilterResponseError(response, deserializeValue),
      ),
      catchError((error) => this.handleRequestException(error)),
    );
  }

  async getValues({
    fundId,
    startDate,
  }: {
    fundId: string;
    // YYYY-MM-DD
    startDate: string;
  }) {
    const firstFundValueResult = await this.getValueAtPage({
      fundId,
      startDate,
      page: 1,
    }).toPromise();
    if (firstFundValueResult.kind === 'error') {
      return firstFundValueResult;
    }
    const { pages } = firstFundValueResult.data;
    this.logService.info('total page number received', {
      fundId,
      pages,
      startDate,
    });
    const valueResults = await runInPool<FundValueResponse>({
      generatePromise: (idx) =>
        // eslint-disable-next-line no-async-promise-executor
        new Promise(async (resolve, reject) => {
          const result = await this.getValueAtPage({
            fundId,
            page: idx + 2,
            startDate,
          }).toPromise();
          if (result.kind === 'ok') {
            this.logService.info('fund value fetched', {
              fundId,
              page: idx + 2,
              startDate,
            });
            // So that we won't be banned by third party api
            await new Promise((r) => setTimeout(r, 500));
            resolve(result.data);
          } else {
            this.logService.error('fail to get fund value from eastMoney', {
              fundId,
              startDate,
              page: idx + 2,
              error: result.error,
            });
            reject(result.error);
          }
        }),
      totalNumber: pages - 1,
      maxConcurrency: 5,
    });
    if (valueResults.kind === 'error') {
      return valueResults;
    }
    const { values } = firstFundValueResult.data;
    valueResults.data.forEach((response) => {
      values.push(...response.values);
    });
    return Result.createOk(values);
  }

  getList(): Observable<Result.T<FundBasicInfoCN[], any>> {
    const url = 'http://fund.eastmoney.com/js/fundcode_search.js';
    this.logService.info('fetching fund list', { url });
    return this.httpService.get(url).pipe(
      map((response) =>
        this.maybeFilterResponseError(response, deserializeList),
      ),
      catchError((error) => this.handleRequestException(error)),
    );
  }
}
