import * as cheerio from 'cheerio';
import { evalInVm } from '../../utils/eval';
import { NetValue } from '../../analyze/analyze';
import {
  deserializeNumber,
  deserializeString,
  deserializeDate,
} from '../../utils/deserilization';

type FundValuesParams = {
  curPage: number;
  records: number;
  pages: number;
  content: string;
};

function parseNetValues(htmlContent: string): NetValue[] {
  const result: NetValue[] = [];
  const $ = cheerio.load(htmlContent);
  $('tr').each((_, ele) => {
    const cells = ele.children;
    if (cells[0].name === 'th') {
      return;
    }
    const date = deserializeDate(cells[0].children[0], 'data');
    const value = deserializeNumber(cells[1].children[0], 'data');
    result.push({ date, value });
  });
  return result;
}

function parseApiResult(code: string): FundValuesParams {
  const { apidata } = evalInVm(code);
  return {
    curPage: deserializeNumber(apidata, 'curpage'),
    records: deserializeNumber(apidata, 'records'),
    pages: deserializeNumber(apidata, 'pages'),
    content: deserializeString(apidata, 'content'),
  };
}

export class FundValuesProto {
  curPage: number;
  records: number;
  pages: number;
  // In ACES order
  netValues: NetValue[];
  constructor({
    curPage,
    records,
    pages,
    netValues,
  }: Omit<FundValuesParams, 'content'> & {
    netValues: NetValue[];
  }) {
    this.curPage = curPage;
    this.records = records;
    this.pages = pages;
    this.netValues = netValues;
  }

  static deserialize(reply: unknown) {
    if (typeof reply !== 'string') {
      throw new Error('expect reply to be string, got ' + typeof reply);
    }
    const result = parseApiResult(reply);
    const netValues = parseNetValues(result.content);
    netValues.sort((a, b) => a.date.getTime() - b.date.getTime());
    return new FundValuesProto({
      curPage: result.curPage,
      records: result.records,
      pages: result.pages,
      netValues,
    });
  }
}
