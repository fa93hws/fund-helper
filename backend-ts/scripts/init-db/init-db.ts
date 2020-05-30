import { readFileSync } from 'fs';
import { join } from 'path';
import { pgServiceFactory } from '../../src/modules/database/pg.factory';

export async function main() {
  const pgService = pgServiceFactory();
  const sql = readFileSync(join(__dirname, 'init-db.sql'), {
    encoding: 'utf-8',
  });
  await pgService.execute(sql);
}
