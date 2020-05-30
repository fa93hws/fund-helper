import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { EastMoneyService } from './eastmoney/eastmoney.service';
import { Result } from '../../utils/result-type';
import { PGService } from '../database/pg.service';
import { tableNames } from '../database/pg.constant';
import { BunyanLogService } from '../log/bunyan.service';
import { FundValueCN } from '../../protos/fund-cn.proto';

@Injectable()
export class FundValueCNService {
  constructor(
    private readonly eastMoneyService: EastMoneyService,
    private readonly pgService: PGService,
    private readonly logService: BunyanLogService,
  ) {}

  // exposed for testing only
  async getValuesFromDB(fundId: string) {
    return this.pgService.select<FundValueCN>(
      {
        fields: ['time', 'value'],
        tableName: tableNames.fundValuesCN,
        where: 'id=$1',
        order: [{ field: 'time', type: 'ASC' }],
      },
      [fundId],
    );
  }

  // exposed for testing only
  async writeValuesToDB(fundId: string, fundValues: readonly FundValueCN[]) {
    this.logService.info('write additional data to db', {
      fundId,
    });
    const sqlInsertValuesPlaceholder = fundValues.reduce<string[][]>(
      (acc, _, idx) => {
        const startIdx = idx * 3;
        const valuePlaceholders = [
          `$${startIdx + 1}`,
          `$${startIdx + 2}`,
          `$${startIdx + 3}`,
        ];
        acc.push(valuePlaceholders);
        return acc;
      },
      [],
    );
    const sqlInsertValues = fundValues.reduce<(string | number | Date)[]>(
      (acc, cur) => {
        // need to be sync with fields in the sql statement
        acc.push(fundId, cur.time, cur.value);
        return acc;
      },
      [],
    );
    const dbWriteResult = await this.pgService.insert(
      {
        fields: ['id', 'time', 'value'],
        tableName: tableNames.fundValuesCN,
        values: sqlInsertValuesPlaceholder,
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
      sqlInsertValues,
    );
    if (dbWriteResult.kind === 'ok') {
      this.logService.info('additional values is written to db', {
        fundId,
        rows: dbWriteResult.data,
      });
    } else {
      this.logService.error('additional values failed to be written to db', {
        fundId,
        error: dbWriteResult.error,
      });
    }
  }

  // Get most recent available date for that fund values in the database
  // return yyyy-mm-dd
  private getMostRecentDate(ascOrderedSelectResult: FundValueCN[]): string {
    if (ascOrderedSelectResult.length > 0) {
      const dateTime =
        ascOrderedSelectResult[ascOrderedSelectResult.length - 1].time;
      return moment(dateTime).format('YYYY-MM-DD');
    }
    return '1970-01-01';
  }

  // It is assume fundId is correct e.g. it exists in fund list
  // It return void error result e.g. Result.createError() on error
  async getValues(fundId: string): Promise<Result.T<FundValueCN[], void>> {
    this.logService.info('try reading values from DB', { fundId });
    const valueFromDBResult = await this.getValuesFromDB(fundId);
    if (valueFromDBResult.kind === 'error') {
      this.logService.error('fail to read values from DB', { fundId });
      return Result.createError();
    }
    const mostRecentDate = this.getMostRecentDate(valueFromDBResult.data.rows);
    this.logService.info('got most recent date', {
      date: mostRecentDate,
      fundId,
    });
    if (mostRecentDate === moment(Date.now()).format('YYYY-MM-DD')) {
      this.logService.info(
        'most recent date is today, not need to fetch additional values',
      );
      return Result.createOk(valueFromDBResult.data.rows);
    }
    const additionalValuesResult = await this.eastMoneyService.getValues({
      fundId,
      startDate: mostRecentDate,
    });
    if (additionalValuesResult.kind === 'error') {
      return Result.createError();
    }
    const additionalValues = additionalValuesResult.data;
    additionalValues.sort((a, b) => (a.time > b.time ? 1 : -1));
    const fundValues = [
      ...valueFromDBResult.data.rows,
      // The first one is duplicated in db
      ...additionalValues.slice(1),
    ];
    // Writing the additional values to database should not block the response.
    // It can be pushed into MQ
    setTimeout(
      async () => await this.writeValuesToDB(fundId, additionalValues),
    );
    return Result.createOk(fundValues);
  }
}
