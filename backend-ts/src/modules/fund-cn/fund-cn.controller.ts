import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { FundCNService } from './fund-cn.service';
import { BunyanLogService } from '../log/bunyan.service';
import { FundCNValueResponse } from '../../protos/fund-cn.proto';

@Controller({
  path: 'cn-funds',
})
export class FundCNController {
  constructor(
    private readonly fundValueService: FundCNService,
    private readonly logService: BunyanLogService,
  ) {}

  @Get(':id')
  async getFundValues(
    @Param('id') fundId: string,
  ): Promise<FundCNValueResponse> {
    this.logService.info('Receive request querying fund values', { fundId });
    const infoResult = await this.fundValueService.getFundInfo(fundId);
    if (infoResult.kind === 'error') {
      if (infoResult.error === 'NOT_FOUND') {
        this.logService.info('no match fund with id', { fundId });
        throw new NotFoundException();
      }
      this.logService.error('failed to find fund info', { fundId });
      throw new InternalServerErrorException();
    }
    const valuesResult = await this.fundValueService.getValues(fundId);
    if (valuesResult.kind === 'error') {
      this.logService.error('failed to find fund', { fundId });
      throw new InternalServerErrorException(valuesResult.error.toString());
    }
    this.logService.info('fund values found', { fundId });
    return { values: valuesResult.data, info: infoResult.data };
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
