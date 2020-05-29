import { readFileSync } from 'fs';
import { join } from 'path';
import { createPGServiceFactory } from '../../src/services/database/pg.factory';

export async function main() {
  const pgService = createPGServiceFactory();
  const sql = readFileSync(join(__dirname, 'init-db.sql'), {
    encoding: 'utf-8',
  });
  await pgService.execute(sql);
}
