import { handler } from '../statistics';
import { EastMoneyService } from '../../../services/eastmoney/eastmoney-service';

describe('StatisticsHandler', () => {
  const getFundInfoList = jest.fn();
  const getNetValues = jest.fn();
  const eastMoneyService = ({
    getFundInfoList,
  } as any) as EastMoneyService;

  afterEach(() => {
    getFundInfoList.mockRestore();
    getNetValues.mockRestore();
  });

  it('throws if given fund id does not exist in fund list', async () => {
    getFundInfoList.mockReturnValueOnce({});
    await expect(
      handler({ numDays: 10, fundId: '123', eastMoneyService, getNetValues }),
    ).rejects.toMatchInlineSnapshot(
      `[Error: No matching result for fundId = 123]`,
    );
    expect(getNetValues).not.toHaveBeenCalled();
  });

  it('fetch the fund values if fund id is found', async () => {
    getFundInfoList.mockReturnValueOnce({ '123': { name: 'guming' } });
    getNetValues.mockReturnValueOnce([{ date: 1, value: 1 }]);
    console.log = () => undefined; // eslint-disable-line no-console
    await handler({
      numDays: 100,
      fundId: '123',
      eastMoneyService,
      getNetValues,
      enableStdout: false,
    });
    expect(getNetValues).toHaveBeenCalledWith({
      fetchNetValues: expect.any(Function),
      numDays: 100,
    });
  });
});
