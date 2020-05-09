// TODO Refactor to result type
export const enum ResultKind {
  OK,
  ERROR,
}

export const enum ErrorKind {
  NOT_FOUND,
  UNKNOWN_ERROR,
  REQUEST_FAIL,
}

export type ResultType =
  | {
      kind: ResultKind.OK;
      data: any;
    }
  | {
      kind: ResultKind.ERROR;
      errorKind: ErrorKind;
      error?: Error;
    };

export interface CanFetchFundValue {
  fetchFundValues(id: string): Promise<ResultType>;
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

  async fetchFundValues(id: string): Promise<ResultType> {
    try {
      const response = await this.fetch(this.URL + id);
      switch (response.status) {
        case 404:
          return { kind: ResultKind.ERROR, errorKind: ErrorKind.NOT_FOUND };
        case 200: {
          const data = await response.json();
          return { kind: ResultKind.OK, data };
        }
        default:
          return {
            kind: ResultKind.ERROR,
            errorKind: ErrorKind.UNKNOWN_ERROR,
            error: new Error(`unknown status code = ${response.status}`),
          };
      }
    } catch (e) {
      return {
        kind: ResultKind.ERROR,
        errorKind: ErrorKind.REQUEST_FAIL,
        error: e,
      };
    }
  }
}
