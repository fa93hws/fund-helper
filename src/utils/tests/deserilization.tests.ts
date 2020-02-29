import {
  deserializeNumber,
  deserializeString,
  deserializeDate,
} from '../deserilization';

describe('deserializeNumber', () => {
  it('can deserialize number correctly', () => {
    const obj = { num: 1 };
    expect(deserializeNumber(obj, 'num')).toBe(1);
  });

  it('can deserialize parsable string correctly', () => {
    const obj = { num: '1' };
    expect(deserializeNumber(obj, 'num')).toBe(1);
  });

  it('throw if input is boolean', () => {
    const obj = { num: false };
    expect(() => deserializeNumber(obj, 'num')).toThrow();
  });
});

describe('deserializeString', () => {
  it('can deserialize string correctly', () => {
    const obj = { str: '1' };
    expect(deserializeString(obj, 'str')).toBe('1');
  });

  it('throw if input is number', () => {
    const obj = { str: 1 };
    expect(() => deserializeString(obj, 'str')).toThrow();
  });
});

describe('deserializeDate', () => {
  it('should parse date correctly', () => {
    const obj = { date: '1989-09-12' };
    expect(deserializeDate(obj, 'date').getTime()).toEqual(621586800000);
  });

  it('throws if input is not a valid string', () => {
    const obj = { date: '123alkdjf' };
    expect(() => deserializeDate(obj, 'date')).toThrow();
  });

  it('throws if input is a boolean', () => {
    const obj = { date: false };
    expect(() => deserializeDate(obj, 'date')).toThrow();
  });
});
