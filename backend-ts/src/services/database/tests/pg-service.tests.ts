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
      expect(fakeSqlQuery).toBeCalledWith(
        'SELECT fieldA,fieldB FROM table',
        undefined,
      );
    });

    it('builds simple sql with where statement', async () => {
      pgService.select({
        fields: ['fieldA', 'fieldB'],
        tableName: 'table',
        where: 'fieldA > 2',
      });
      expect(fakeSqlQuery).toBeCalledWith(
        'SELECT fieldA,fieldB FROM table WHERE fieldA > 2',
        undefined,
      );
    });

    it('builds simple sql with where and params', async () => {
      pgService.select(
        {
          fields: ['fieldA', 'fieldB'],
          tableName: 'table',
          where: 'fieldA > $1',
        },
        ['2'],
      );
      expect(
        fakeSqlQuery,
      ).toBeCalledWith('SELECT fieldA,fieldB FROM table WHERE fieldA > $1', [
        '2',
      ]);
    });
  });

  describe('insert', () => {
    it('builds simple sql with fields, table name and values only', async () => {
      pgService.insert({
        fields: ['fieldA', 'fieldB'],
        tableName: 'table',
        values: [['1', '2']],
      });
      expect(fakeSqlQuery).toBeCalledWith(
        'INSERT INTO table (fieldA,fieldB) VALUES (1,2)',
        undefined,
      );
    });

    it('returns error if length of the fields does not match with length of the value', async (done) => {
      const sqlResult = await pgService.insert({
        fields: ['fieldA', 'fieldB'],
        tableName: 'table',
        values: [['1', '2', '3']],
      });
      expect(fakeSqlQuery).not.toBeCalled();
      if (sqlResult.kind === 'error') {
        expect(sqlResult.error).toMatchInlineSnapshot(
          `[Error: got values length 3 but fields length 2. values: 1,2,3, fields: fieldA,fieldB]`,
        );
        done();
      } else {
        done.fail('it should fail');
      }
    });

    it('builds simple sql with update when conflicts', async () => {
      pgService.insert({
        fields: ['fieldA', 'fieldB'],
        tableName: 'table',
        values: [['1', '2']],
        conflict: {
          field: 'fieldA',
          set: [{ field: 'fieldA', value: 'value' }],
        },
      });
      expect(fakeSqlQuery).toBeCalledWith(
        'INSERT INTO table (fieldA,fieldB) VALUES (1,2) ON CONFLICT (fieldA) DO UPDATE SET fieldA = value',
        undefined,
      );
    });

    it('builds simple sql with update multiple fields when conflicts', async () => {
      pgService.insert({
        fields: ['fieldA', 'fieldB'],
        tableName: 'table',
        values: [['1', '2']],
        conflict: {
          field: 'fieldA',
          set: [
            { field: 'fieldA', value: 'value' },
            { field: 'fieldB', value: 'val' },
          ],
        },
      });
      expect(fakeSqlQuery).toBeCalledWith(
        'INSERT INTO table (fieldA,fieldB) VALUES (1,2) ON CONFLICT (fieldA) DO UPDATE SET fieldA = value,fieldB = val',
        undefined,
      );
    });

    it('builds simple sql with multiple values', async () => {
      pgService.insert({
        fields: ['fieldA', 'fieldB'],
        tableName: 'table',
        values: [
          ['1', '2'],
          ['3', '4'],
        ],
      });
      expect(fakeSqlQuery).toBeCalledWith(
        'INSERT INTO table (fieldA,fieldB) VALUES (1,2),(3,4)',
        undefined,
      );
    });
  });
});
