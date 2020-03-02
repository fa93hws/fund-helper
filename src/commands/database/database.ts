import { Argv } from 'yargs';
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
  console.error('you must provide a sub command, type --help for help');
}

export function addDatabaseCommand(yargs: Argv) {
  return yargs.command('database', 'Manipulate databases', {
    builder: (yargsIn): Argv<{}> =>
      yargsIn.command('init', 'Purge database and recreate everything.', {
        builder: y => y,
        handler: initHandler,
      }),
    handler: defaultHandler,
  });
}
