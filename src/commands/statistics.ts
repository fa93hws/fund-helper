import { calculateBasics } from '../analyze/analyze';
import { HttpService } from '../services/http/http';
import { EastMoneyService } from '../services/eastmoney/eastmoney-service';
import * as yargs from 'yargs';

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
  const eastMoneyService = new EastMoneyService(httpService);

  const { name } = await eastMoneyService.getFundInfo(fundId);
  const { netValues } = await eastMoneyService.getNetValues({
    id: fundId,
    pageNum: 1,
  });
  const statistics = calculateBasics(netValues);
  console.log(`
    基金ID: ${fundId}
    基金名称: ${name}
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
