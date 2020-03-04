import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export class PGService {
  constructor(private readonly pool: Pool) {}

  async query<T = any>(queryString: string, values?: (string | Date)[]) {
    return this.pool.query<T>(queryString, values);
  }

  async initDB() {
    const sqlContent = readFileSync(resolve(__dirname, 'init.sql'), {
      encoding: 'utf-8',
    });
    await this.pool.query(sqlContent);
  }

  killPool() {
    this.pool.end();
  }
}
