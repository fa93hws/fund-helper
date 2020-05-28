import { Injectable } from '@nestjs/common';
import { EastMoneyService } from './eastmoney/eastmoney.service';
import { Result } from '../../utils/result-type';
import { PGService, SelectStatement } from '../../services/database/pg.service';
import { tableNames } from '../../services/database/pg.constant';
import { FundCNValue, FundCNBasicInfo } from './fund-cn.dto';

@Injectable()
export class FundCNService {
  constructor(
    private readonly eastMoneyService: EastMoneyService,
    private readonly pgService: PGService,
  ) {}

  async getValues(fundId: string): Promise<Result.T<FundCNValue[], any>> {
    return this.eastMoneyService.getValues(fundId);
  }

  async getList(): Promise<Result.T<FundCNBasicInfo[], any>> {
    const listResponseResult = await this.eastMoneyService
      .getList()
      .toPromise();
    if (listResponseResult.kind === 'error') {
      return listResponseResult;
    }
    const valuesPlaceholders: string[][] = [];
    const valuesParams: string[] = [];
    listResponseResult.data.forEach((info, idx) => {
      valuesParams.push(info.id, info.name, info.type);
      const startIdx = idx * 3;
      valuesPlaceholders.push([
        `$${startIdx + 1}`,
        `$${startIdx + 2}`,
        `$${startIdx + 3}`,
      ]);
    });
    const insertResult = await this.pgService.insert(
      {
        fields: ['id', 'name', 'type'],
        tableName: tableNames.fundCnList,
        values: valuesPlaceholders,
        conflict: {
          field: 'id',
          set: [
            {
              field: 'name',
              value: 'EXCLUDED.name',
            },
            {
              field: 'type',
              value: 'EXCLUDED.type',
            },
          ],
        },
      },
      valuesParams,
    );
    if (insertResult.kind === 'ok') {
      return listResponseResult;
    }
    return insertResult;
  }

  async getFundInfo(id: string): Promise<Result.T<FundCNBasicInfo, any>> {
    const queryStatement: SelectStatement = {
      fields: ['id', 'name', 'type'],
      tableName: tableNames.fundCnList,
      where: 'id = $1',
    };
    const queryResult = await this.pgService.select<FundCNBasicInfo>(
      queryStatement,
      [id],
    );
    if (queryResult.kind === 'error') {
      return queryResult;
    }
    if (queryResult.data.rowCount === 1) {
      return Result.createOk(queryResult.data.rows[0]);
    }
    if (queryResult.data.rowCount > 1) {
      return Result.createError(
        new Error(`multiple match found for fund id=${id}`),
      );
    }
    const getListResult = await this.getList();
    if (getListResult.kind === 'error') {
      return getListResult;
    }
    const queryAgainResult = await this.pgService.select<FundCNBasicInfo>(
      queryStatement,
      [id],
    );
    if (queryAgainResult.kind === 'error') {
      return queryAgainResult;
    }
    if (queryAgainResult.data.rowCount !== 1) {
      return Result.createError(
        new Error(`0 or multiple results found for fundId=${id}`),
      );
    }
    return Result.createOk(queryAgainResult.data.rows[0]);
  }
}
