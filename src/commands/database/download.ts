import { Argv } from 'yargs';
import { yellow, red } from 'chalk';
import { HttpService } from '../../services/http/http';
import { LocalIOService } from '../../services/local-io/local-io';
import { PersistCacheService } from '../../services/cache/persist-cache';
import { createPool } from '../../services/database/connection';
import { PGService } from '../../services/database/pgservice';
import { FundListService } from '../../services/database/fund-list/fund-list';
import { EastMoneyService } from '../../services/eastmoney/eastmoney-service';

type CliArgs = {
  fundId: string[];
};

function createEastMoneyService() {
  const httpService = new HttpService();
  const eastMoneyLocalIOService = new LocalIOService({ folder: 'east-money' });
  const eastMoneyCacheService = new PersistCacheService(
    eastMoneyLocalIOService,
  );
  return new EastMoneyService(httpService, eastMoneyCacheService);
}

async function maybeDownloadList({
  dbService,
  eastMoneyService = createEastMoneyService(),
}: {
  dbService: PGService;
  eastMoneyService?: EastMoneyService;
}) {
  const fundListService = new FundListService(dbService);
  if (!(await fundListService.isEmpty())) {
    return console.log(
      yellow('fund list is not empty, skip updating fund list'),
    );
  }
  const fundList = await eastMoneyService.getFundInfoList();
  await fundListService.writeToDB(fundList);
  console.log(
    yellow('fund list has been downloaded and added to the databases'),
  );
}

async function downloadHandler({ fundId }: CliArgs) {
  if (fundId.length === 0) {
    console.error(red('fund id must not be empty!'));
    process.exit(1);
  }
  const dbPool = createPool('prod');
  const dbService = new PGService(dbPool);
  try {
    await maybeDownloadList({ dbService });
  } finally {
    dbPool.end();
  }
}

export function addDownloadCommand(y: Argv<any>) {
  return y.command('download [fundId...]', 'download fund net values', {
    builder: (yargs: Argv<any>) =>
      yargs.positional('fundId', {
        describe: 'fund id or "all" if you want to download all funds',
        type: 'string',
        alias: 'fund-id',
      }),
    handler: downloadHandler as any,
  });
}
