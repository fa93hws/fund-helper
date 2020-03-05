import * as Debug from 'debug';
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

const debug = Debug('download').extend('debug');

type CliArgs = {
  fundIds: string[];
  continueFrom?: string;
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

async function downloadOne({
  fundId,
  fundListService,
  eastMoneyService,
  fundNetValuesService,
}: {
  fundId: string;
  fundListService: FundListService;
  eastMoneyService: EastMoneyService;
  fundNetValuesService: FundNetValuesService;
}) {
  const fundInfo = await fundListService.findInfo(fundId);
  debug({ ...fundInfo, fundId });
  if (fundInfo == null) {
    console.error(red(`No matching result for fundId: ${fundId}`));
    return process.exit(1);
  }
  if (
    fundInfo.type.includes('债券') ||
    fundInfo.type.includes('理财') ||
    fundInfo.type.includes('货币') ||
    fundInfo.type.includes('保本')
  ) {
    return;
  }
  console.log(yellow(`${fundInfo.name}(${fundInfo.type})@${fundId}`));
  const netValues = await downloadAllValues({ fundId, eastMoneyService });
  if (netValues.length === 0) {
    return;
  }
  await fundNetValuesService.writeToDB({ fundId, netValues });
}

async function getQueryIds({
  fundIds,
  fundListService,
}: {
  fundIds: string[];
  fundListService: FundListService;
}) {
  if (!fundIds.includes('all')) {
    return fundIds;
  }
  const infos = await fundListService.getList();
  return infos.map(info => info.id);
}

// TODO Add unit test
async function downloadHandler({ fundIds, continueFrom }: CliArgs) {
  const {
    eastMoneyService,
    fundListService,
    dbService,
    fundNetValuesService,
  } = createServices();
  const queryIds = await getQueryIds({ fundIds, fundListService });
  let skip = continueFrom != null;
  try {
    await maybeDownloadList({ fundListService, eastMoneyService });
    /* eslint-disable no-await-in-loop */
    // Too many request causes request failure, we need to slow it down :(
    for (let idx = 0; idx < queryIds.length; idx += 1) {
      if (queryIds[idx] === continueFrom) {
        skip = false;
      }
      if (skip) {
        // eslint-disable-next-line no-continue
        continue;
      }
      console.log(`${idx}/${queryIds.length}`);
      await downloadOne({
        fundId: queryIds[idx],
        fundListService,
        fundNetValuesService,
        eastMoneyService,
      });
    }
    /* eslint-enable no-await-in-loop */
  } finally {
    dbService.killPool();
  }
}

export function addDownloadCommand(y: Argv<any>) {
  return y.command('download [fundIds...]', 'download fund net values', {
    builder: (yargs: Argv<any>) =>
      yargs
        .positional('fundIds', {
          describe: 'fund id or "all" if you want to download all funds',
          type: 'string',
          alias: 'fund-ids',
        })
        .option('continueFrom', {
          describe: 'download from this id',
          type: 'string',
          alias: 'continue-from',
        }),
    handler: downloadHandler as any,
  });
}
