import { Pool } from 'pg';
import { PGService } from '../pg.service';

describe('PGService', () => {
  const fakeSqlQuery = jest.fn();
  const PGPool = (class {
    query(...params: unknown[]) {
      return fakeSqlQuery(...params);
    }
  } as any) as typeof Pool;
  const pgService = new PGService(
    {
      username: '',
      password: '',
      dbName: '',
      port: 123,
    },
    PGPool,
  );

  beforeEach(() => {
    fakeSqlQuery.mockRestore();
  });

  describe('select', () => {
    it('builds simple sql with fields and table name only', async () => {
      pgService.select({ fields: ['fieldA', 'fieldB'], tableName: 'table' });
      expect(fakeSqlQuery).toBeCalledWith('SELECT fieldA,fieldB FROM table');
    });
  });
});
