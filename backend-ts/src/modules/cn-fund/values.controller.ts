import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { EastMoneyService } from './eastmoney/eastmoney.service';

@Controller()
export class FundValuesController {
  constructor(private eastMoneyService: EastMoneyService) {}

  @Get('cn-funds/:id')
  async getFundValues(@Param('id') fundId: string) {
    const response = await this.eastMoneyService.getValues(fundId).toPromise();
    if (response.kind === 'ok') {
      return { response: response.data };
    } else {
      throw new InternalServerErrorException(response.error.toString());
    }
  }

  @Get('cn-funds')
  async getFundList() {
    const response = await this.eastMoneyService.getList().toPromise();
    if (response.kind === 'ok') {
      return { response: response.data };
    } else {
      throw new InternalServerErrorException(response.error.toString());
    }
  }
}
