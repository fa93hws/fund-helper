import { Injectable } from '@nestjs/common';
import { EastMoneyService } from './eastmoney/eastmoney.service';
import { Result } from '../../utils/result-type';
import { FundValue } from './values.dto';

@Injectable()
export class FundValueService {
  constructor(private eastMoneyService: EastMoneyService) {}

  async getValues(fundId: string): Promise<Result.T<FundValue[], any>> {
    const firstFundValueResult = await this.eastMoneyService
      .getValues(fundId, 1)
      .toPromise();
    if (firstFundValueResult.kind === 'error') {
      return firstFundValueResult;
    }
    const { pages } = firstFundValueResult.data;
    // page starts from 2, because 1 has been received before
    const valueResultPromises = new Array(pages - 1)
      .fill(0)
      .map((_, idx) =>
        this.eastMoneyService.getValues(fundId, idx + 2).toPromise(),
      );
    const valueResults = await Promise.all(valueResultPromises);
    const values: FundValue[] = firstFundValueResult.data.values;
    for (let idx = 0; idx < valueResults.length; idx += 1) {
      const valueResult = valueResults[idx];
      if (valueResult.kind === 'error') {
        return valueResult;
      }
      values.push(...valueResult.data.values);
    }
    return Result.createOk(values);
  }

  getList() {
    return this.eastMoneyService.getList().toPromise();
  }
}
