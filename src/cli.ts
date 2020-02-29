import * as yargs from 'yargs';
import { addStatisticsCommand } from './commands/statistics/statistics';

export async function main() {
  addStatisticsCommand(yargs)
    .strict(true)
    .exitProcess(true)
    .demandCommand()
    .showHelpOnFail(false, 'Specify --help for available options')
    .help()
    .parse();
}
