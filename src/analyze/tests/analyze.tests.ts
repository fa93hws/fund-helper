import { calculateBasics } from '../analyze';

describe('calculateBasics', () => {
  it('throws if input is empty', () => {
    expect(() => calculateBasics([])).toThrow();
  });

  it('calculate as max 4, min 1, average 2.5 for [1,2,3,4]', () => {
    const netValues = [
      { date: new Date(1), value: 1 },
      { date: new Date(11), value: 2 },
      { date: new Date(111), value: 3 },
      { date: new Date(1111), value: 4 },
    ];
    expect(calculateBasics(netValues)).toEqual({
      max: 4,
      min: 1,
      average: 2.5,
    });
  });
});
