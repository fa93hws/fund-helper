import { Argv } from 'yargs';
import { red } from 'chalk';
import { createPool } from '../../services/database/connection';
import { PGService } from '../../services/database/pgservice';
import { calculateBasics } from '../../analyze/analyze';
import { HttpService } from '../../services/http/http';
import { EastMoneyService } from '../../services/eastmoney/eastmoney-service';
import { formatOutput } from './statistics-out-template';
import { getNetValues } from '../../utils/net-values';
import {
  maybeDownloadList,
  FundListService,
} from '../../services/fund-list/fund-list';

type CliArgs = {
  numDays: number;
  fundId: string;
};

function createServices() {
  const httpService = new HttpService();
  const eastMoneyService = new EastMoneyService(httpService);
  const dbPool = createPool('prod');
  const dbService = new PGService(dbPool);
  const fundListService = new FundListService(dbService);
  return { eastMoneyService, fundListService, dbService };
}

async function printFundStatistics({
  numDays,
  fundId,
  fundListService,
  eastMoneyService,
}: {
  numDays: number;
  fundId: string;
  fundListService: FundListService;
  eastMoneyService: EastMoneyService;
}) {
  const fundInfo = await fundListService.findInfo(fundId);
  if (fundInfo == null) {
    console.error(red(`No matching result for fundId: ${fundId}`));
    return process.exit(1);
  }
  const fetchNetValues = (pageNum: number) =>
    eastMoneyService.getNetValues({ id: fundId, pageNum });
  const netValues = await getNetValues({ fetchNetValues, numDays });
  const statistics = calculateBasics(netValues);
  const output = formatOutput({
    fundId,
    fundName: fundInfo.name,
    max: statistics.max,
    min: statistics.min,
    average: statistics.average,
    numDays,
  });
  console.log(output);
}

async function handler({ numDays, fundId }: CliArgs) {
  const { eastMoneyService, fundListService, dbService } = createServices();
  try {
    await maybeDownloadList({ fundListService, eastMoneyService });
    await printFundStatistics({
      numDays,
      fundId,
      eastMoneyService,
      fundListService,
    });
  } catch (e) {
    console.error(e);
  } finally {
    dbService.killPool();
  }
}

export function addStatisticsCommand(yargs: Argv) {
  return yargs.command(
    'statistics',
    'calculate statics such as x days average/min/max',
    {
      builder: (): Argv<CliArgs> =>
        yargs
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
    },
  );
}
