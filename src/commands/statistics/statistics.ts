import { Argv } from 'yargs';
import { red } from 'chalk';
import { createPool } from 'services/database/connection';
import { PGService } from 'services/database/pgservice';
import { HttpService } from 'services/http/http';
import { EastMoneyService } from 'services/eastmoney/eastmoney-service';
import { getNetValues as _getNetValues } from 'utils/net-values';
import {
  maybeDownloadList,
  FundListService,
} from 'services/fund-list/fund-list';
import { calculateBasics } from '../../analyze/analyze';
import { formatOutput } from './statistics-out-template';

type CliArgs = {
  numDays: number;
  fundIds: string[];
};

function createServices() {
  const httpService = new HttpService();
  const eastMoneyService = new EastMoneyService(httpService);
  const dbPool = createPool('prod');
  const dbService = new PGService(dbPool);
  const fundListService = new FundListService(dbService);
  return { eastMoneyService, fundListService, dbService };
}

// export for test only
export async function printFundStatistics({
  numDays,
  fundId,
  fundListService,
  eastMoneyService,
  getNetValues = _getNetValues,
}: {
  numDays: number;
  fundId: string;
  fundListService: FundListService;
  eastMoneyService: EastMoneyService;
  getNetValues?: typeof _getNetValues;
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
    fundType: fundInfo.type,
    max: statistics.max,
    min: statistics.min,
    average: statistics.average,
    numDays,
  });
  console.log(output);
}

async function handler({ numDays, fundIds }: CliArgs) {
  const { eastMoneyService, fundListService, dbService } = createServices();
  try {
    await maybeDownloadList({ fundListService, eastMoneyService });
    const promises = fundIds.map(fundId =>
      printFundStatistics({
        numDays,
        fundId,
        eastMoneyService,
        fundListService,
      }),
    );
    await Promise.all(promises);
  } catch (e) {
    console.error(e);
  } finally {
    dbService.killPool();
  }
}

export function addStatisticsCommand(yargs: Argv) {
  return yargs.command(
    'statistics [fundIds...]',
    'calculate statics such as x days average/min/max',
    {
      builder: (): Argv<any> =>
        yargs
          .positional('fundIds', {
            description: 'id of the fund',
            type: 'string',
          })
          .option('numDays', {
            alias: 'num-days',
            demand: true,
            description: 'number of days need to be taken into consideration',
            type: 'number',
          }),
      handler: handler as any,
    },
  );
}
