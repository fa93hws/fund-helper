import { evalInVm } from '../../utils/eval';

type FundInfo = {
  abbr: string;
  name: string;
  type: string;
  pinyin: string;
}

// return: id, abbr, name, type, pinyin
function parseApiResult(code: string): [string, string, string, string, string][] {
  const { r } = evalInVm(code);
  if (!Array.isArray(r)) {
    throw new Error(`expect fund list is an array`);
  }
  r.forEach(info => {
    if (!Array.isArray(info)) {
      throw new Error('fund info must be in array');
    }
    if (info.length !== 5) {
      throw new Error('fund info must have 5 elements');
    }
    info.forEach(field => {
      if (typeof field !== 'string') {
        throw new Error(`item in fund info must be string, got ${field}`)
      }
    })
  })
  return r;
}

export class FundListProto {
  constructor(public fundList: Record<string, FundInfo>) {}

  static deserialize(reply: unknown) {
    if (typeof reply !== 'string') {
      throw new Error('expect reply to be string, got ' + typeof reply);
    }
    const result = parseApiResult(reply);
    const fundList = result.reduce<Record<string, FundInfo>>((acc, cur) => {
      acc[cur[0]] = {
        abbr: cur[1],
        name: cur[2],
        type: cur[3],
        pinyin: cur[4],
      }
      return acc;
    }, {});
    return new FundListProto(fundList);
  }
}
