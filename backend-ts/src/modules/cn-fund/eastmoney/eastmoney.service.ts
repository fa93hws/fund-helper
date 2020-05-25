import { Injectable, HttpService } from '@nestjs/common';
import { Result } from '../../../utils/result-type';
import { transformResponse, HttpResult } from '../../../utils/http-result';
import { deserializeValue } from './deserialize-value';

@Injectable()
export class EastMoneyService {
  constructor(private httpService: HttpService) {}

  getValues(): Promise<Result.T<any, any>> {
    return new Promise(resolve => {
      this.httpService
        .get(
          'http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=377240',
        )
        .toPromise()
        .then(response => {
          const dataResult = transformResponse(response);
          if (dataResult.kind == 'ok') {
            const deserializationResult = deserializeValue(dataResult.data);
            if (deserializationResult.kind === 'ok') {
              resolve(Result.createOk(deserializationResult.data));
            } else {
              resolve(Result.createError(deserializationResult.error));
            }
          } else {
            resolve(dataResult);
          }
        })
        .catch(e => {
          resolve(
            Result.createError({
              statusCode: -1,
              statusText: 'Did not get response from the backend server',
              error: e,
            }),
          );
        });
    });
  }
}
