import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { FundCNService } from './fund-cn.service';
import { BunyanLogService } from '../log/bunyan.service';

@Controller({
  path: 'cn-funds',
})
export class FundCNController {
  constructor(
    private readonly fundValueService: FundCNService,
    private readonly logService: BunyanLogService,
  ) {}

  @Get(':id')
  async getFundValues(@Param('id') fundId: string) {
    this.logService.info(`Receive request querying fund values for ${fundId}`, {
      fundId,
    });
    const infoResult = await this.fundValueService.getFundInfo(fundId);
    if (infoResult.kind === 'error') {
      this.logService.error(`failed to find fund info for for ${fundId}`, {
        fundId,
      });
      throw new InternalServerErrorException(infoResult.error.toString());
    }
    const valuesResult = await this.fundValueService.getValues(fundId);
    if (valuesResult.kind === 'error') {
      this.logService.error(`failed to find fund values for ${fundId}`, {
        fundId,
      });
      throw new InternalServerErrorException(valuesResult.error.toString());
    }
    if (valuesResult.kind === 'ok' && infoResult.kind === 'ok') {
      this.logService.info(`fund values found for ${fundId}`, {
        fundId,
      });
      return { values: valuesResult.data, info: infoResult.data };
    }
  }

  @Get()
  async getFundList() {
    this.logService.info('Receive request querying fund values list');
    const response = await this.fundValueService.getList();
    if (response.kind === 'ok') {
      this.logService.info('Fundlist request returned');
      return { response: response.data };
    } else {
      this.logService.error('Fundlist request failed');
      throw new InternalServerErrorException(response.error.toString());
    }
  }
}
