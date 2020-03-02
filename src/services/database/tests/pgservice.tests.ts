/* eslint-disable @typescript-eslint/camelcase */
import { createPool } from '../connection';
import { PGService } from '../pgservice';

describe('CreateClient', () => {
  const pool = createPool('test');

  beforeAll(async done => {
    const pgService = new PGService(pool);
    await pgService.initDB();
    done();
  });

  it('create two databases during initialization', async () => {
    const queryName = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema='public' AND table_type='BASE TABLE';
    `;
    const res = await pool.query(queryName);
    expect(res.rows).toEqual([
      { table_name: 'fund_info' },
      { table_name: 'fund_net_values' },
    ]);
  });

  it('fund_info table should have the following shape', async () => {
    const queryName = `
    SELECT COLUMN_NAME, DATA_TYPE
    FROM information_schema.COLUMNS WHERE TABLE_NAME = 'fund_info';
    `;
    const res = await pool.query(queryName);
    expect(res.rows).toEqual([
      { column_name: 'id', data_type: 'character varying' },
      { column_name: 'name', data_type: 'character varying' },
      { column_name: 'type', data_type: 'character varying' },
    ]);
  });

  it('fund_net_values table should have the following shape', async () => {
    const queryName = `
    SELECT COLUMN_NAME, DATA_TYPE
    FROM information_schema.COLUMNS WHERE TABLE_NAME = 'fund_net_values';
    `;
    const res = await pool.query(queryName);
    expect(res.rows).toEqual([
      { column_name: 'id', data_type: 'character varying' },
      { column_name: 'time', data_type: 'timestamp without time zone' },
      { column_name: 'value', data_type: 'real' },
    ]);
  });

  afterAll(async done => {
    await pool.end();
    done();
  });
});
