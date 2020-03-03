import { Argv } from 'yargs';
import { red } from 'chalk';
import { HttpService } from '../../services/http/http';
import { createPool } from '../../services/database/connection';
import { PGService } from '../../services/database/pgservice';
import {
  maybeDownloadList,
  FundListService,
} from '../../services/fund-list/fund-list';
import { EastMoneyService } from '../../services/eastmoney/eastmoney-service';

type CliArgs = {
  fundId: string[];
};

function createServices() {
  const dbPool = createPool('prod');
  const dbService = new PGService(dbPool);
  const httpService = new HttpService();
  const eastMoneyService = new EastMoneyService(httpService);
  const fundListService = new FundListService(dbService);
  return { eastMoneyService, fundListService, dbService };
}

async function downloadHandler({ fundId }: CliArgs) {
  if (fundId.length === 0) {
    console.error(red('fund id must not be empty!'));
    process.exit(1);
  }
  const { eastMoneyService, fundListService, dbService } = createServices();
  try {
    await maybeDownloadList({ fundListService, eastMoneyService });
  } finally {
    dbService.killPool();
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
