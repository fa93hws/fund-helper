import { Result } from '../utils/result-type';

export type FundValues = {
  id: string;
  name: string;
  typ: string;
  values: {
    date: number;
    real_value: number;
  }[];
};

export interface CanFetchFundValue {
  fetchFundValues(id: string): Promise<Result<FundValues>>;
}

export class FundValueService implements CanFetchFundValue {
  private readonly URL = '/api_v1/values/';

  private readonly fetch: typeof window.fetch;

  constructor(fetch?: typeof window.fetch) {
    this.fetch =
      fetch == null
        ? (this.fetch = (input: RequestInfo, init?: RequestInit) =>
            window.fetch(input, init))
        : (this.fetch = fetch);
  }

  async fetchFundValues(id: string): Promise<Result<FundValues>> {
    try {
      const response = await this.fetch(this.URL + id);
      switch (response.status) {
        case 404:
          return { kind: 'error', error: new Error(`找不到基金ID=${id}`) };
        case 200: {
          const data = await response.json();
          return { kind: 'ok', data };
        }
        default:
          return {
            kind: 'error',
            error: new Error(`未知状态码 ${response.status}`),
          };
      }
    } catch (e) {
      return {
        kind: 'error',
        error: e,
      };
    }
  }
}
