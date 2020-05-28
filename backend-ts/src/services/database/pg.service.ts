import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Result } from '../../utils/result-type';

export type PGServiceParam = {
  username: string;
  password: string;
  dbName: string;
  port: number;
};

type BaseStatement = {
  fields: string[];
  tableName: string;
};

export type SelectStatement = BaseStatement & {
  where?: string;
};

type InsertStatement = BaseStatement & {
  conflict?: {
    field: string;
    set?: {
      field: string;
      value: string;
    }[];
  };
  values: string[][];
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
    params?: any[],
  ): Promise<Result.T<{ rows: T[]; rowCount: number }, any>> {
    const { fields, tableName, where } = statement;
    const sqlBuffer = [`SELECT ${fields.join(',')} FROM ${tableName}`];
    if (where != null) {
      sqlBuffer.push(`WHERE ${where}`);
    }
    try {
      const queryResult = await this.pool.query<T>(sqlBuffer.join(' '), params);
      return Result.createOk({
        rows: queryResult.rows,
        rowCount: queryResult.rowCount,
      });
    } catch (e) {
      return Result.createError(e);
    }
  }

  async insert(
    statement: InsertStatement,
    params?: any[],
  ): Promise<Result.T<number, any>> {
    const { fields, tableName, conflict, values } = statement;
    const sqlBuffer = [`INSERT INTO ${tableName} (${fields.join(',')}) VALUES`];
    const valueBuffer = [];
    for (const value of values) {
      if (value.length !== fields.length) {
        return Result.createError(
          new Error(
            `got values length ${value.length} but fields length ${fields.length}. values: ${value}, fields: ${fields}`,
          ),
        );
      }
      valueBuffer.push(`(${value.join(',')})`);
    }
    sqlBuffer.push(valueBuffer.join(','));
    if (conflict != null) {
      sqlBuffer.push(`ON CONFLICT (${conflict.field}) DO`);
      const { set } = conflict;
      if (set == null) {
        sqlBuffer.push('NOTHING');
      } else {
        const setStatements = set.map(
          ({ field, value }) => `${field} = ${value}`,
        );
        sqlBuffer.push('UPDATE SET', setStatements.join(','));
      }
    }
    try {
      const queryResult = await this.pool.query(sqlBuffer.join(' '), params);
      return Result.createOk(queryResult.rowCount);
    } catch (e) {
      return Result.createError(e);
    }
  }
}
