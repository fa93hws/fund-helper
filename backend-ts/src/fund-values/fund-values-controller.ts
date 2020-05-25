import { Controller, Get } from '@nestjs/common';

@Controller()
export class FundValuesController {
  @Get()
  getFundValues() {
    return { message: 123 };
  }
}
