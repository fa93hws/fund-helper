import * as yargs from 'yargs';
import { addStatisticsCommand } from './commands/statistics/statistics';
import { addDatabaseCommand } from './commands/database/database';

export async function main() {
  const commands = [addStatisticsCommand, addDatabaseCommand];
  commands
    .reduce((acc, cur) => cur(acc), yargs)
    .strict(true)
    .exitProcess(true)
    .demandCommand()
    .showHelpOnFail(false, 'Specify --help for available options')
    .help()
    .parse();
}
