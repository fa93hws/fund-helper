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

  @Get('cn-funds/:id')
  async getFundValues(@Param('id') fundId: string) {
    const response = await this.fundValueService.getValues(fundId);
    if (response.kind === 'ok') {
      return { response: response.data };
    } else {
      throw new InternalServerErrorException(response.error.toString());
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
