import { Argv } from 'yargs';
import { createPool } from '../../services/database/connection';
import { PGService } from '../../services/database/pgservice';

// for testing
export async function handler() {
  const pgPool = createPool('prod');
  const pgService = new PGService(pgPool);
  await pgService.initDB();
  console.log('database initialized'); // eslint-disable-line no-console
}

export function addInitDBCommand(yargs: Argv) {
  return yargs.command(
    'database:init',
    'clear everything in the database and recreate all tables',
    { builder: () => yargs, handler },
  );
}
