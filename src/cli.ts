import { calculateBasics } from './analyze/analyze';
import { HttpService } from './services/http/http';
import { EastMoneyService } from './services/eastmoney/eastmoney';

export async function main() {
  const httpService = new HttpService();
  const eastMoneyService = new EastMoneyService(httpService);

  const { netValues } = await eastMoneyService.getNetValues({
    id: '160220',
    pageNum: 1,
  });
  console.log(calculateBasics(netValues));
}