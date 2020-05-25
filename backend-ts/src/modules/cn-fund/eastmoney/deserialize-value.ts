import * as vm from 'vm';
import * as cheerio from 'cheerio';
import { utc } from 'moment';
import { Result } from '../../../utils/result-type';

type FundValue = {
  date: Date;
  value: number;
};
export function deserializeValue(
  valueResponse: unknown,
): Result.T<FundValue[]> {
  if (typeof valueResponse !== 'string') {
    return Result.createError(new Error('valueResponse is not string!'));
  }
  const context: any = {};
  vm.createContext(context);
  vm.runInContext(valueResponse, context);
  if (typeof context.apidata?.content !== 'string') {
    return Result.createError(
      new Error('Failed to get apidata in context as string'),
    );
  }
  try {
    const values = tryExtractValuesFromHTML(context.apidata.content);
    return Result.createOk(values);
  } catch (e) {
    return Result.createError(e);
  }
}

function tryExtractValuesFromHTML(
  html: string,
): { date: Date; value: number }[] {
  const $ = cheerio.load(html);
  const rows = $('tbody>tr').toArray();
  const values = rows.map(row => {
    const dateStr = row.children[0]?.children[0]?.data;
    if (typeof dateStr !== 'string' || !/\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      throw new Error(`type of date is not in yyyy-mm-dd, html: ${html}`);
    }
    // Market closes at 15:00 (GMT+8)
    const date = utc(dateStr)
      .add(7, 'hours')
      .toDate();
    const valueStr = row.children[2]?.children[0]?.data;
    if (typeof valueStr !== 'string' || isNaN(parseFloat(valueStr))) {
      throw new Error(
        `type of value can not be parsed to float, html: ${html}`,
      );
    }
    const value = parseFloat(valueStr);
    return { date, value };
  });
  return values;
}
