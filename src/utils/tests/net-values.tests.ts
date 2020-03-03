import { fakeNetValues } from 'services/eastmoney/fake/fake-values';
import { getNetValues } from '../net-values';

describe('getNetValues', () => {
  const fetchNetValues = jest.fn().mockImplementation((pageNum: number) => {
    if (pageNum < 3) {
      return Promise.resolve(fakeNetValues[pageNum - 1]);
    }
    throw new Error('not implemented');
  });

  afterEach(() => fetchNetValues.mockClear());

  it('gets given number (> 20) of elements', async () => {
    const netValues = await getNetValues({ numDays: 21, fetchNetValues });
    expect(fetchNetValues).toHaveBeenCalledTimes(2);
    expect(netValues).toEqual([
      {
        date: 1519171200000,
        value: 30,
      },
      {
        date: 1519948800000,
        value: 31,
      },
      {
        date: 1520035200000,
        value: 32,
      },
      {
        date: 1520121600000,
        value: 33,
      },
      {
        date: 1520208000000,
        value: 34,
      },
      {
        date: 1520294400000,
        value: 35,
      },
      {
        date: 1520380800000,
        value: 36,
      },
      {
        date: 1520467200000,
        value: 37,
      },
      {
        date: 1520553600000,
        value: 38,
      },
      {
        date: 1520640000000,
        value: 39,
      },
      {
        date: 1520726400000,
        value: 40,
      },
      {
        date: 1520812800000,
        value: 41,
      },
      {
        date: 1520899200000,
        value: 42,
      },
      {
        date: 1520985600000,
        value: 43,
      },
      {
        date: 1521072000000,
        value: 44,
      },
      {
        date: 1521158400000,
        value: 45,
      },
      {
        date: 1521244800000,
        value: 46,
      },
      {
        date: 1521331200000,
        value: 47,
      },
      {
        date: 1521417600000,
        value: 48,
      },
      {
        date: 1521504000000,
        value: 49,
      },
      {
        date: 1521590400000,
        value: 50,
      },
    ]);
  });

  it('gets given number (< 20) of elements', async () => {
    const netValues = await getNetValues({ numDays: 2, fetchNetValues });
    expect(fetchNetValues).toHaveBeenCalledTimes(1);
    expect(netValues).toEqual([
      {
        date: 1521504000000,
        value: 49,
      },
      {
        date: 1521590400000,
        value: 50,
      },
    ]);
  });

  it('return empty array if 0 elements is queried', async () => {
    const netValues = await getNetValues({ numDays: 0, fetchNetValues });
    expect(fetchNetValues).not.toHaveBeenCalled();
    expect(netValues).toEqual([]);
  });

  it.todo('throws if requested number is larger than the total number');
});
