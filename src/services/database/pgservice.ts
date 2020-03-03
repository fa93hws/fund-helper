import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export class PGService {
  constructor(private readonly pool: Pool) {}

  async query<T = any>(queryString: string) {
    return this.pool.query<T>(queryString);
  }

  async initDB() {
    const sqlContent = readFileSync(resolve(__dirname, 'init.sql'), {
      encoding: 'utf-8',
    });
    await this.pool.query(sqlContent);
  }
}
