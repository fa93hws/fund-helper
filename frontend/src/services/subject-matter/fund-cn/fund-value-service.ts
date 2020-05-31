import { Result } from '../../../utils/result-type';
import type { FundValueWithInfoCN } from './fund-cn.proto';
import { CanFetchSubjectMatter } from '../subject-matter';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deserializeFundValues(responseBody: any): FundValueWithInfoCN {
  const { info, values } = responseBody;
  if (info == null) {
    throw new Error('info should not be null');
  }
  const { id, name, type } = info;
  if (
    typeof id !== 'string' ||
    typeof name !== 'string' ||
    typeof type !== 'string'
  ) {
    throw new Error(`id, name and type must be string!`);
  }
  if (!Array.isArray(values)) {
    throw new Error('values must be array');
  }
  const fundValues = values.map((fundValue) => {
    const { time, value } = fundValue;
    if (Number.isNaN(Date.parse(time))) {
      throw new Error(`time is invalid! ${time}`);
    }
    const parsedTime = new Date(time);
    const parsedValue = parseFloat(value);
    if (Number.isNaN(parsedValue)) {
      throw new Error(`value can not be parsed to float! ${value}`);
    }
    return { time: parsedTime, value: parsedValue };
  });
  return {
    info: {
      name,
      id,
      type,
    },
    values: fundValues,
  };
}

export class CNFundValueService implements CanFetchSubjectMatter {
  private readonly URL = '/api/v1/cn-funds/';

  private readonly fetch: typeof window.fetch;

  constructor(fetch?: typeof window.fetch) {
    this.fetch =
      fetch == null
        ? (this.fetch = (input: RequestInfo, init?: RequestInit) =>
            window.fetch(input, init))
        : (this.fetch = fetch);
  }

  async fetchSubjectMatter(id: string): Promise<Result<FundValueWithInfoCN>> {
    try {
      const response = await this.fetch(this.URL + id);
      switch (response.status) {
        case 404:
          return { kind: 'error', error: new Error(`找不到基金ID=${id}`) };
        case 200: {
          const data = await response.json();
          const parsedData = deserializeFundValues(data);
          return { kind: 'ok', data: parsedData };
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
