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
  FundCNBasicInfo,
  FundCNValue,
} from '../../../protos/fund-cn.proto';

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

  getValueAtPage(
    fundId: string,
    page: number,
  ): Observable<Result.T<FundValueResponse, any>> {
    const url = `http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=${fundId}&page=${page}&per=20`;
    this.logService.info('fetching fund values from remote', { url });
    return this.httpService.get(url).pipe(
      map((response) =>
        this.maybeFilterResponseError(response, deserializeValue),
      ),
      catchError((error) => this.handleRequestException(error)),
    );
  }

  async getValues(fundId: string) {
    const firstFundValueResult = await this.getValueAtPage(
      fundId,
      1,
    ).toPromise();
    if (firstFundValueResult.kind === 'error') {
      return firstFundValueResult;
    }
    const { pages } = firstFundValueResult.data;
    this.logService.info('total page number received', { fundId, pages });
    // page starts from 2, because 1 has been received before
    const valueResultPromises = new Array(pages - 1)
      .fill(0)
      .map((_, idx) => this.getValueAtPage(fundId, idx + 2).toPromise());
    const valueResults = await Promise.all(valueResultPromises);
    const values: FundCNValue[] = firstFundValueResult.data.values;
    for (let idx = 0; idx < valueResults.length; idx += 1) {
      const valueResult = valueResults[idx];
      if (valueResult.kind === 'error') {
        this.logService.error('fail to get value', {
          fundId,
          page: idx + 2,
          error: valueResult.error,
        });
        return valueResult;
      }
      values.push(...valueResult.data.values);
    }
    return Result.createOk(values);
  }

  getList(): Observable<Result.T<FundCNBasicInfo[], any>> {
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
