import * as yargs from 'yargs';
import { addStatisticsCommand } from './commands/statistics/statistics';
import { addInitDBCommand } from './commands/database/init-db';

export async function main() {
  const commands = [addStatisticsCommand, addInitDBCommand];
  commands
    .reduce((acc, cur) => cur(acc), yargs)
    .strict(true)
    .exitProcess(true)
    .demandCommand()
    .showHelpOnFail(false, 'Specify --help for available options')
    .help()
    .parse();
}
