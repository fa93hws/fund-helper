import * as vm from 'vm';
import * as cheerio from 'cheerio';
import { utc } from 'moment';
import { Result } from '../../../utils/result-type';
import type {
  FundValueCN,
  FundBasicInfoCN,
} from '../../../protos/fund-cn.proto';
import { FundTypeCN } from '../../../protos/fund-cn.proto';

export type FundValueResponse = {
  values: FundValueCN[];
  curPage: number;
  pages: number;
};

function getFundTypeFromStr(typeStr: string): FundTypeCN {
  switch (typeStr) {
    case '混合型':
    case '混合-FOF':
      return FundTypeCN.混合;
    case '债券型':
    case '定开债券':
    case '债券指数':
      return FundTypeCN.债券;
    case '联接基金':
    case '股票指数':
    case 'QDII-指数':
    case 'ETF-场内':
    case 'QDII-ETF':
      return FundTypeCN.指数;
    case '货币型':
    case '理财型':
    case '固定收益':
    case '分级杠杆':
    case '保本型':
    case '其他创新':
      return FundTypeCN.其他;
    case 'QDII':
    case '股票型':
    case '股票-FOF':
      return FundTypeCN.股票;
    default:
      throw new Error(`unknown fund type ${typeStr}`);
  }
}

function tryExtractFundBasicInfos(rawList: unknown[]): FundBasicInfoCN[] {
  return rawList.map((rawInfo) => {
    if (!Array.isArray(rawInfo)) {
      throw new Error(`rawInfo must be an array, got ${rawInfo}`);
    }
    if (rawInfo.length !== 5) {
      throw new Error(
        `rawInfo should have 5 element, got ${rawInfo.length} from [${rawInfo}]`,
      );
    }
    const id = rawInfo[0];
    if (typeof id !== 'string') {
      throw new Error(`id should be string, got ${id} from [${rawInfo}]`);
    }
    const name = rawInfo[2];
    if (typeof name !== 'string') {
      throw new Error(`name should be string, got ${name} from [${rawInfo}]`);
    }
    const typeStr = rawInfo[3];
    if (typeof typeStr !== 'string') {
      throw new Error(
        `typeStr should be string, got ${typeStr} from [${rawInfo}]`,
      );
    }
    return {
      id,
      name,
      type: getFundTypeFromStr(typeStr),
    };
  });
}

function tryExtractValuesFromHTML(
  html: string,
): { time: Date; value: number }[] {
  const $ = cheerio.load(html);
  const rows = $('tbody>tr').toArray();
  const values = rows.map((row) => {
    const dateStr = row.children[0]?.children[0]?.data;
    if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new Error(`type of date is not in yyyy-mm-dd, html: ${html}`);
    }
    // Market closes at 15:00 (GMT+8)
    const date = utc(dateStr).add(7, 'hours').toDate();
    const valueStr = row.children[2]?.children[0]?.data;
    if (typeof valueStr !== 'string' || Number.isNaN(parseFloat(valueStr))) {
      throw new Error(
        `type of value can not be parsed to float, html: ${html}`,
      );
    }
    const value = parseFloat(valueStr);
    return { time: date, value };
  });
  return values;
}

export function deserializeValue(
  valueResponse: unknown,
): Result.T<{
  values: FundValueCN[];
  curPage: number;
  pages: number;
}> {
  if (typeof valueResponse !== 'string') {
    return Result.createError(new Error('valueResponse is not string!'));
  }
  const context: any = {};
  vm.createContext(context);
  vm.runInContext(valueResponse, context);
  if (typeof context.apidata?.content !== 'string') {
    return Result.createError(
      new Error('Failed to get apidata.content as string'),
    );
  }
  const pages = context.apidata?.pages;
  if (typeof pages !== 'number') {
    return Result.createError(
      new Error('Failed to get apidata.pages as number'),
    );
  }
  const curPage = context.apidata?.curpage;
  if (typeof curPage !== 'number') {
    return Result.createError(
      new Error('Failed to get apidata.curpage as number'),
    );
  }
  try {
    const values = tryExtractValuesFromHTML(context.apidata.content);
    return Result.createOk({ values, curPage, pages });
  } catch (e) {
    return Result.createError(e);
  }
}

export function deserializeList(
  listResponse: unknown,
): Result.T<FundBasicInfoCN[]> {
  if (typeof listResponse !== 'string') {
    return Result.createError(new Error('valueResponse is not string!'));
  }
  const context: any = {};
  vm.createContext(context);
  vm.runInContext(listResponse, context);
  if (!Array.isArray(context.r)) {
    return Result.createError(new Error('Failed to get r in context as array'));
  }
  try {
    const list = tryExtractFundBasicInfos(context.r);
    return Result.createOk(list);
  } catch (e) {
    return Result.createError(e);
  }
}
