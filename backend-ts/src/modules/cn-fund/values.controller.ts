import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { FundValueService } from './values.service';

@Controller()
export class FundValuesController {
  constructor(private fundValueService: FundValueService) {}

  @Get('cn-fund/:id')
  async getFundValues(@Param('id') fundId: string) {
    const infoResult = await this.fundValueService.getFundInfo(fundId);
    if (infoResult.kind === 'error') {
      throw new InternalServerErrorException(infoResult.error.toString());
    }
    const valuesResult = await this.fundValueService.getValues(fundId);
    if (valuesResult.kind === 'error') {
      throw new InternalServerErrorException(valuesResult.error.toString());
    }
    if (valuesResult.kind === 'ok' && infoResult.kind === 'ok') {
      return { values: valuesResult.data, info: infoResult.data };
    }
  }

  @Get('cn-funds')
  async getFundList() {
    const response = await this.fundValueService.getList();
    if (response.kind === 'ok') {
      return { response: response.data };
    } else {
      throw new InternalServerErrorException(response.error.toString());
    }
  }
}
