import { existsSync } from 'fs';
import { join, resolve } from 'path';
import * as Yargs from 'yargs';
import { fetchSubjectMatter } from './http';
import { calculate } from './metrics/calculate';
import type { ParamsConfig } from './interfaces/params-config.interface';

const mlRoot = resolve(__dirname, '..');

type CliArgs = {
  paramsPath: string;
  subjectMatterId: string;
};

async function handler({ paramsPath, subjectMatterId }: CliArgs) {
  const normalizedPath = join(mlRoot, paramsPath);
  if (!existsSync(normalizedPath)) {
    throw new Error(`params config file @${paramsPath} does not exist`);
  }
  // eslint-disable-next-line
  const paramsConfig: ParamsConfig = require(normalizedPath);
  const subjectMatter = await fetchSubjectMatter(subjectMatterId);
  const res = calculate(subjectMatter, paramsConfig);
  return res;
}

export function main() {
  Yargs.command('$0', 'preprocess data for machine learning', {
    builder: (): Yargs.Argv<CliArgs> =>
      Yargs.option('paramsPath', {
        demand: true,
        description: 'path to params configuration json file',
        type: 'string',
      }).option('subjectMatterId', {
        demand: true,
        description: 'id of the subject matter',
        type: 'string',
      }),
    handler,
  })
    .strict(true)
    .exitProcess(true)
    .demandCommand()
    .showHelpOnFail(false, 'Specify --help for available options')
    .help()
    .parse();
}
