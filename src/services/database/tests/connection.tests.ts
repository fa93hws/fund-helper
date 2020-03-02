import { createPool } from '../connection';

describe('CreateClient', () => {
  it('can connect to the test DB correctly', async () => {
    const pool = createPool('test');
    const res = await pool.query('SELECT $1::text as message', [
      'Hello world!',
    ]);
    expect(res.rows[0].message).toEqual('Hello world!');
    await pool.end();
  });

  it('can connect to the prod DB correctly', async () => {
    const pool = createPool('prod');
    const res = await pool.query('SELECT $1::text as message', [
      'Hello world!',
    ]);
    expect(res.rows[0].message).toEqual('Hello world!');
    await pool.end();
  });
});
