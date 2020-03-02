import { Argv, showHelp } from 'yargs';
import { red } from 'chalk';
import { createPool } from '../../services/database/connection';
import { PGService } from '../../services/database/pgservice';

async function initHandler() {
  const pgPool = createPool('prod');
  const pgService = new PGService(pgPool);
  await pgService.initDB();
  pgPool.end();
  console.log('database initialized');
}

function defaultHandler() {
  console.error(red('you must provide a sub command'));
  showHelp();
}

export function addDatabaseCommand(yargs: Argv) {
  return yargs.command('database', 'Manipulate databases', {
    builder: (y): Argv<{}> =>
      y.command('init', 'Purge database and recreate everything.', {
        builder: yy => yy,
        handler: initHandler,
      }),
    handler: defaultHandler,
  });
}
