import { calculateBasics } from '../analyze/analyze';
import { HttpService } from '../services/http/http';
import { EastMoneyService } from '../services/eastmoney/eastmoney';
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

  const { netValues } = await eastMoneyService.getNetValues({
    id: fundId,
    pageNum: 1,
  });
  console.log(calculateBasics(netValues));
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
