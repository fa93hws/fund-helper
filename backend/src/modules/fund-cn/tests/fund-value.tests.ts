import { FundValueCNService } from '../fund-value.service';
import { EastMoneyService } from '../eastmoney/eastmoney.service';
import { fakeBunyanLogService } from '../../log/fake/fake-bunyan.service';
import { PGService } from '../../database/pg.service';

describe('FundValueCNService', () => {
  const fakeEastMoneyGetValues = jest.fn();

  const fakeEastMoneyService = ({
    getValues: fakeEastMoneyGetValues,
  } as any) as EastMoneyService;

  const fakePgInsert = jest.fn();
  const fakePgSelect = jest.fn();
  const pgService = ({
    insert: fakePgInsert,
    select: fakePgSelect,
  } as any) as PGService;

  beforeEach(() => {
    fakePgInsert.mockRestore();
    fakePgSelect.mockRestore();
    fakeEastMoneyGetValues.mockRestore();
  });

  describe('getValuesFromDB', () => {
    const fakeService = new FundValueCNService(
      fakeEastMoneyService,
      pgService,
      fakeBunyanLogService,
    );

    beforeEach(() => {
      fakeEastMoneyGetValues.mockRestore();
      fakePgInsert.mockRestore();
      fakePgSelect.mockRestore();
    });

    it('query db with the following statement', async () => {
      await fakeService.getValuesFromDB('fund-id');
      expect(fakePgSelect).toBeCalledWith(
        {
          fields: ['time', 'value'],
          tableName: 'cn_fund_values',
          where: 'id=$1',
          order: [{ field: 'time', type: 'ASC' }],
        },
        ['fund-id'],
      );
    });
  });

  describe('writeValuesToDB', () => {
    const fakeService = new FundValueCNService(
      fakeEastMoneyService,
      pgService,
      fakeBunyanLogService,
    );

    it('query the db with the following statement', async () => {
      const date1 = new Date(1600000000000);
      const date2 = new Date(1500000000000);
      fakePgInsert.mockReturnValue({ kind: 'ok' });
      await fakeService.writeValuesToDB('fund-id', [
        { time: date1, value: 1.23 },
        { time: date2, value: 2.34 },
      ]);
      expect(fakePgInsert).toBeCalledWith(
        {
          fields: ['id', 'time', 'value'],
          tableName: 'cn_fund_values',
          values: [
            ['$1', '$2', '$3'],
            ['$4', '$5', '$6'],
          ],
          conflict: {
            fields: ['id', 'time'],
            set: [
              {
                field: 'value',
                value: 'EXCLUDED.value',
              },
            ],
          },
        },
        ['fund-id', date1, 1.23, 'fund-id', date2, 2.34],
      );
    });
  });

  describe('getValues', () => {
    const fakeService = new FundValueCNService(
      fakeEastMoneyService,
      pgService,
      fakeBunyanLogService,
    );
    const fakeGetValuesFromDB = jest.fn();
    const fakeWriteValuesToDB = jest.fn();
    fakeService.getValuesFromDB = fakeGetValuesFromDB;
    fakeService.writeValuesToDB = fakeWriteValuesToDB;

    beforeEach(() => {
      fakePgInsert.mockRestore();
      fakePgSelect.mockRestore();
      fakeEastMoneyGetValues.mockRestore();
      fakeGetValuesFromDB.mockRestore();
      fakeWriteValuesToDB.mockRestore();
    });

    jest
      .spyOn(Date, 'now')
      .mockImplementation(() => new Date('1999-02-02').getTime());

    it('returns whatever in the database if the most recent date is today', async () => {
      fakeGetValuesFromDB.mockReturnValue({
        kind: 'ok',
        data: {
          rows: [
            { time: new Date('1989-09-12'), value: 1.23 },
            { time: new Date('1999-02-02'), value: 2.34 },
          ],
        },
      });
      const result = await fakeService.getValues('fund-id');
      expect(fakeEastMoneyGetValues).not.toBeCalled();
      expect(fakeWriteValuesToDB).not.toBeCalled();
      expect(result).toEqual({
        kind: 'ok',
        data: [
          { time: new Date('1989-09-12'), value: 1.23 },
          { time: new Date('1999-02-02'), value: 2.34 },
        ],
      });
    });

    it.only('aggregates the additional values and save to database', async () => {
      jest.useFakeTimers();
      fakeGetValuesFromDB.mockReturnValue({
        kind: 'ok',
        data: {
          rows: [
            { time: new Date('1989-09-12'), value: 1.23 },
            { time: new Date('1999-02-01'), value: 2.34 },
          ],
        },
      });
      fakeEastMoneyGetValues.mockReturnValue({
        kind: 'ok',
        data: [
          { time: new Date('2001-02-01'), value: 2.34 },
          { time: new Date('2000-09-12'), value: 1.23 },
          { time: new Date('1999-02-01'), value: 2.34 },
        ],
      });
      const result = await fakeService.getValues('fund-id');
      jest.advanceTimersByTime(1000);
      expect(fakeEastMoneyGetValues).toBeCalledWith({
        fundId: 'fund-id',
        startDate: '1999-02-01',
      });
      expect(fakeWriteValuesToDB).toBeCalledWith('fund-id', [
        { time: new Date('1999-02-01'), value: 2.34 },
        { time: new Date('2000-09-12'), value: 1.23 },
        { time: new Date('2001-02-01'), value: 2.34 },
      ]);
      expect(result).toEqual({
        kind: 'ok',
        data: [
          { time: new Date('1989-09-12'), value: 1.23 },
          { time: new Date('1999-02-01'), value: 2.34 },
          { time: new Date('2000-09-12'), value: 1.23 },
          { time: new Date('2001-02-01'), value: 2.34 },
        ],
      });
      jest.clearAllTimers();
    });
  });
});
