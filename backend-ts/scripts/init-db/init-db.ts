import { readFileSync } from 'fs';
import { join } from 'path';
import { EnvProvider } from '../../src/modules/config/env.provider';
import { PGService } from '../../src/modules/database/pg.service';
import { PGConfigProvider } from '../../src/modules/config/pg-config.provider';
import { ConsoleLogService } from '../../src/modules/log/console-log.service';

export async function main() {
  const sql = readFileSync(join(__dirname, 'init-db.sql'), {
    encoding: 'utf-8',
  });
  const envProvider = new EnvProvider(new ConsoleLogService());
  const pgConfigProvider = new PGConfigProvider(
    envProvider,
    new ConsoleLogService(),
  );
  const pgService = new PGService(pgConfigProvider);
  await pgService.execute(sql);
}
