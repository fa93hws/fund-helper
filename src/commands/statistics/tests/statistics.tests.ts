import { EOL } from 'os';
import { red } from 'chalk';
import { EastMoneyService } from 'services/eastmoney/eastmoney-service';
import { FundListService } from 'services/fund-list/fund-list';
import { printFundStatistics } from '../statistics';

describe('printFundStatistics', () => {
  const findInfo = jest.fn();
  const fundListService = ({ findInfo } as any) as FundListService;
  const getNetValues = jest.fn();
  const eastMoneyService = ({
    getNetValues: jest.fn(),
  } as any) as EastMoneyService;

  beforeEach(() => {
    findInfo.mockReset();
  });

  it('prints the message based on output', async () => {
    const log = jest.fn();
    console.log = log;
    findInfo.mockReturnValueOnce({
      name: 'guming',
      type: 'cwx',
    });
    getNetValues.mockReturnValueOnce([{ time: 0, value: 1 }]);
    await printFundStatistics({
      numDays: 1,
      fundId: 'guming',
      getNetValues,
      fundListService,
      eastMoneyService,
    });
    expect(log).toBeCalledWith(
      [
        '基金ID: guming',
        '基金名称: guming',
        '基金类型: cwx',
        '1日均值: 1',
        '1日最高: 1',
        '1日最低: 1',
        '',
      ].join(EOL),
    );
  });

  it('throws if fund info is not found', async () => {
    const error = jest.fn();
    const exit = jest.fn();
    (process as any).exit = exit;
    console.error = error;
    findInfo.mockReturnValueOnce(undefined);
    getNetValues.mockReturnValueOnce([{ time: 0, value: 1 }]);
    await printFundStatistics({
      numDays: 1,
      fundId: 'guming',
      getNetValues,
      fundListService,
      eastMoneyService,
    });
    expect(error).toBeCalledWith(red('No matching result for fundId: guming'));
    expect(exit).toHaveBeenCalledWith(1);
  });
});
