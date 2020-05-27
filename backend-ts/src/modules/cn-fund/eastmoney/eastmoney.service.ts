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
import type { FundBasicInfo } from '../values.dto';

@Injectable()
export class EastMoneyService {
  constructor(private httpService: HttpService) {
    this.handleRequestException = this.handleRequestException.bind(this);
  }

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

  getValues(
    fundId: string,
    page: number,
  ): Observable<Result.T<FundValueResponse, any>> {
    return this.httpService
      .get(
        `http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=${fundId}&page=${page}&per=20`,
      )
      .pipe(
        map((response) =>
          this.maybeFilterResponseError(response, deserializeValue),
        ),
        catchError(this.handleRequestException),
      );
  }

  getList(): Observable<Result.T<FundBasicInfo[], any>> {
    return this.httpService
      .get('http://fund.eastmoney.com/js/fundcode_search.js')
      .pipe(
        map((response) =>
          this.maybeFilterResponseError(response, deserializeList),
        ),
        catchError(this.handleRequestException),
      );
  }
}
