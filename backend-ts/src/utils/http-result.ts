import { AxiosResponse } from 'axios';
import { Result } from './result-type';

type HttpError = {
  statusCode: number;
  statusText: string;
  error: any;
};

export type HttpResult = Result.T<unknown, HttpError>;

export function transformResponse(response: AxiosResponse<any>): HttpResult {
  if (200 <= response.status && response.status < 300) {
    return Result.createOk(response.data);
  }
  return Result.createError({
    statusCode: response.status,
    statusText: response.statusText,
    error: response.data,
  });
}
