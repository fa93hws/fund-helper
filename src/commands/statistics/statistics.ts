import { Argv } from 'yargs';
import { calculateBasics } from '../../analyze/analyze';
import { LocalIOService } from '../../services/local-io/local-io';
import { HttpService } from '../../services/http/http';
import { EastMoneyService } from '../../services/eastmoney/eastmoney-service';
import { PersistCacheService } from '../../services/cache/persist-cache';
import { formatOutput } from './statistics-out-template';
import { getNetValues as _getNetValues } from '../../utils/net-values';

type CliArgs = {
  numDays: number;
  fundId: string;
};

function createEastMoneyService() {
  const httpService = new HttpService();
  const eastMoneyLocalIOService = new LocalIOService({ folder: 'east-money' });
  const eastMoneyCacheService = new PersistCacheService(
    eastMoneyLocalIOService,
  );
  return new EastMoneyService(httpService, eastMoneyCacheService);
}

// for testing
export async function handler({
  numDays,
  fundId,
  eastMoneyService = createEastMoneyService(),
  getNetValues = _getNetValues,
  enableStdout = true,
}: CliArgs & {
  eastMoneyService?: EastMoneyService;
  getNetValues?: typeof _getNetValues;
  enableStdout?: boolean;
}) {
  const fundList = await eastMoneyService.getFundInfoList();
  const fundInfo = fundList[fundId];
  if (fundInfo == null) {
    throw new Error(`No matching result for fundId = ${fundId}`);
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
  if (enableStdout) {
    console.log(output);
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
