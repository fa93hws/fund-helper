import * as yargs from 'yargs';
import { calculateBasics } from '../analyze/analyze';
import { LocalIOService } from '../services/local-io/local-io';
import { HttpService } from '../services/http/http';
import { EastMoneyService } from '../services/eastmoney/eastmoney-service';
import { PersistCacheService } from '../services/cache/persist-cache';

type CliArgs = {
  numDays: number;
  fundId: string;
}

async function handler({ numDays, fundId }: CliArgs) {
  if (numDays > 20) {
    // TODO Fix this!
    throw new Error('numDays > 20 is not supported yet');
  }
  const httpService = new HttpService();
  const eastMoneyLocalIOService = new LocalIOService('east-money');
  const eastMoneyCacheService = new PersistCacheService(eastMoneyLocalIOService);
  const eastMoneyService = new EastMoneyService(httpService, eastMoneyCacheService);

  const fundList = await eastMoneyService.getFundInfoList();
  const fundInfo = fundList[fundId];
  if (fundInfo == null) {
    throw new Error(`No matching result for fundId = ${fundId}`)
  }
  const { netValues } = await eastMoneyService.getNetValues({
    id: fundId,
    pageNum: 1,
  });
  const statistics = calculateBasics(netValues);
  console.log(`
    基金ID: ${fundId}
    基金名称: ${fundInfo.name}
    ${numDays}日均值: ${statistics.average}
    ${numDays}日最高: ${statistics.max}
    ${numDays}日最低: ${statistics.min}
  `);
}

export function addStatisticsCommand(yargs: yargs.Argv) {
  return yargs
    .command('statistics', 'calculate statics such as x days average/min/max', {
      builder: (): yargs.Argv<CliArgs> => yargs
        .option('numDays', {
          alias: 'num-days',
          demand: true,
          description: 'number of days need to be taken into consideration',
          type: 'number',
        })
        .options('fundId', {
          alias: 'fund-id',
          demand: true,
          description: 'id of the fund',
          type: 'string',
        }),
      handler,
    });
}
