import { Argv } from 'yargs';
import { red, yellow } from 'chalk';
import { HttpService } from 'services/http/http';
import { createPool } from 'services/database/connection';
import { PGService } from 'services/database/pgservice';
import {
  maybeDownloadList,
  FundListService,
} from 'services/fund-list/fund-list';
import { EastMoneyService } from 'services/eastmoney/eastmoney-service';
import {
  FundNetValuesService,
  downloadAllValues,
} from 'services/fund-net-values/fund-net-values';

type CliArgs = {
  fundId: string;
};

function createServices() {
  const dbPool = createPool('prod');
  const dbService = new PGService(dbPool);
  const httpService = new HttpService();
  const eastMoneyService = new EastMoneyService(httpService);
  const fundListService = new FundListService(dbService);
  const fundNetValuesService = new FundNetValuesService(dbService);
  return { eastMoneyService, fundListService, dbService, fundNetValuesService };
}

async function downloadHandler({ fundId }: CliArgs) {
  const {
    eastMoneyService,
    fundListService,
    dbService,
    fundNetValuesService,
  } = createServices();
  try {
    await maybeDownloadList({ fundListService, eastMoneyService });
    const fundInfo = await fundListService.findInfo(fundId);
    if (fundInfo == null) {
      console.error(red(`No matching result for fundId: ${fundId}`));
      return process.exit(1);
    }
    const netValues = await downloadAllValues({ fundId, eastMoneyService });
    await fundNetValuesService.writeToDB({ fundId, netValues });
    console.log(
      yellow(`${fundInfo.name}(${fundInfo.type})@${fundId} downloaded`),
    );
  } finally {
    dbService.killPool();
  }
}

export function addDownloadCommand(y: Argv<any>) {
  return y.command('download [fundId]', 'download fund net values', {
    builder: (yargs: Argv<any>) =>
      yargs.positional('fundId', {
        describe: 'fund id or "all" if you want to download all funds',
        type: 'string',
        alias: 'fund-id',
      }),
    handler: downloadHandler as any,
  });
}
