import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { EastMoneyService } from './eastmoney/eastmoney.service';

@Controller()
export class FundValuesController {
  constructor(private eastMoneyService: EastMoneyService) {}

  @Get()
  async getFundValues() {
    const response = await this.eastMoneyService.getValues();
    if (response.kind === 'ok') {
      return { response: response.data };
    } else {
      throw new InternalServerErrorException(response.error.toString());
    }
  }
}
