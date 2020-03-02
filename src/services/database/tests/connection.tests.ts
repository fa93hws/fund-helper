import { createPool } from '../connection';

describe('CreateClient', () => {
  const pool = createPool('test');

  it('can connect to the DB correctly', async () => {
    const res = await pool.query('SELECT $1::text as message', [
      'Hello world!',
    ]);
    expect(res.rows[0].message).toEqual('Hello world!');
  });

  afterEach(async done => {
    await pool.end();
    done();
  });
});
