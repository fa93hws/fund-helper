import { Argv, showHelp } from 'yargs';
import { red, yellow } from 'chalk';
import { createPool } from 'services/database/connection';
import { PGService } from 'services/database/pgservice';
import { addDownloadCommand } from './download';

async function initHandler() {
  const pgPool = createPool('prod');
  const pgService = new PGService(pgPool);
  await pgService.initDB();
  pgPool.end();
  console.log(yellow('database initialized'));
}

function defaultHandler() {
  console.error(red('you must provide a sub command'));
  showHelp();
}

export function addDatabaseCommand(yargs: Argv) {
  return yargs.command('database', 'Manipulate databases', {
    builder: (y): Argv<{}> => {
      const yy = addDownloadCommand(y);
      return yy.command(
        'init',
        'Purge database and recreate everything.',
        initHandler,
      );
    },
    handler: defaultHandler,
  });
}
