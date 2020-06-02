import { Injectable } from '@nestjs/common';
import { Result } from '@fund-helper/utils/result-type';
import { FundBasicInfoCN } from '@fund-helper/protos/fund-cn.proto';
import { EastMoneyService } from './eastmoney/eastmoney.service';
import { PGService, SelectStatement } from '../database/pg.service';
import { tableNames } from '../database/pg.constant';
import { BunyanLogService } from '../log/bunyan.service';

@Injectable()
export class FundInfoCNService {
  constructor(
    private readonly eastMoneyService: EastMoneyService,
    private readonly pgService: PGService,
    private readonly logService: BunyanLogService,
  ) {}

  async getList(): Promise<Result.T<FundBasicInfoCN[], any>> {
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
        tableName: tableNames.fundListCN,
        values: valuesPlaceholders,
        conflict: {
          fields: ['id'],
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
      this.logService.info('fund list is written into database');
      return listResponseResult;
    }
    this.logService.error('fund list failed to be written into database');
    return insertResult;
  }

  private async findFundInfoFromDB(
    id: string,
  ): Promise<Result.T<FundBasicInfoCN, 'NOT_FOUND' | 'OTHERS'>> {
    const queryStatement: SelectStatement = {
      fields: ['id', 'name', 'type'],
      tableName: tableNames.fundListCN,
      where: 'id = $1',
    };
    this.logService.info('try getting fund info from database', { fundId: id });
    const queryResult = await this.pgService.select<FundBasicInfoCN>(
      queryStatement,
      [id],
    );
    if (queryResult.kind === 'error') {
      this.logService.error('error happens during searching fund info', {
        fundId: id,
        error: queryResult.error,
        queryStatement,
      });
      return Result.createError('OTHERS');
    }
    if (queryResult.data.rowCount === 1) {
      return Result.createOk(queryResult.data.rows[0]);
    }
    if (queryResult.data.rowCount > 1) {
      this.logService.error(
        'multiple entries found during searching fund info',
        {
          fundId: id,
          queryStatement,
        },
      );
      return Result.createError('OTHERS');
    }
    return Result.createError('NOT_FOUND');
  }

  async getFundInfo(
    id: string,
  ): Promise<Result.T<FundBasicInfoCN, 'NOT_FOUND' | 'OTHERS'>> {
    const infoResult = await this.findFundInfoFromDB(id);
    if (infoResult.kind === 'ok' || infoResult.error === 'OTHERS') {
      return infoResult;
    }
    this.logService.info(
      'no match fund info at the first place, retry after updating the list',
      { fundId: id },
    );
    const getListResult = await this.getList();
    if (getListResult.kind === 'error') {
      return getListResult;
    }
    const queryAgainResult = await this.findFundInfoFromDB(id);
    if (queryAgainResult.kind === 'ok' || queryAgainResult.error === 'OTHERS') {
      return queryAgainResult;
    }
    return Result.createError('NOT_FOUND');
  }
}
