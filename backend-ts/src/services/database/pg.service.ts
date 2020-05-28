import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Result } from '../../utils/result-type';

export type PGServiceParam = {
  username: string;
  password: string;
  dbName: string;
  port: number;
};

type SelectStatement = {
  fields: string[];
  tableName: string;
};

@Injectable()
export class PGService {
  private readonly pool: Pool;

  constructor(
    { username, password, dbName, port }: PGServiceParam,
    PgPool: typeof Pool = Pool,
  ) {
    this.pool = new PgPool({
      user: username,
      password,
      port,
      database: dbName,
    });
  }

  async select<T>(
    statement: SelectStatement,
  ): Promise<Result.T<{ rows: T[]; rowCount: number }, any>> {
    const { fields, tableName } = statement;
    const sql = `SELECT ${fields.join(',')} FROM ${tableName}`;
    try {
      const queryResult = await this.pool.query<T>(sql);
      return Result.createOk({
        rows: queryResult.rows,
        rowCount: queryResult.rowCount,
      });
    } catch (e) {
      return Result.createError(e);
    }
  }
}
