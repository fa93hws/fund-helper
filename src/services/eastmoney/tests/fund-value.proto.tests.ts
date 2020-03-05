import { FundValuesProto } from '../fund-value.proto';

describe('FundValuesProto', () => {
  it('should deserialize input correctly', () => {
    const input = `var apidata={ content:"<table class='w782 comm lsjz'><thead><tr><th class='first'>净值日期</th><th>单位净值</th><th>累计净值</th><th>日增长率</th><th>申购状态</th><th>赎回状态</th><th class='tor last'>分红送配</th></tr></thead><tbody><tr><td>2017-03-01</td><td class='tor bold'>2.1090</td><td class='tor bold'>2.1090</td><td class='tor bold red'>0.29%</td><td>开放申购</td><td>开放赎回</td><td class='red unbold'></td></tr></tbody></table>",records:1,pages:1,curpage:1};`;
    const result = FundValuesProto.deserialize(input);
    expect(result).toEqual({
      records: 1,
      pages: 1,
      curPage: 1,
      netValues: [
        {
          date: new Date('2017-03-01T07:00:00.000Z'),
          value: 2.109,
        },
      ],
    });
  });

  it('throws if input is not string', () => {
    expect(() => FundValuesProto.deserialize(null)).toThrow();
  });

  it('sorts the netValues', () => {
    const input = `var apidata={ content:"<table class='w782 comm lsjz'><thead><tr><th class='first'>净值日期</th><th>单位净值</th><th>累计净值</th><th>日增长率</th><th>申购状态</th><th>赎回状态</th><th class='tor last'>分红送配</th></tr></thead><tbody><tr><td>2017-03-01</td><td class='tor bold'>2.1090</td><td class='tor bold'>2.1090</td><td class='tor bold red'>0.29%</td><td>开放申购</td><td>开放赎回</td><td class='red unbold'></td></tr><tr><td>2017-02-01</td><td class='tor bold'>2.1090</td><td class='tor bold'>2.1090</td><td class='tor bold red'>0.29%</td><td>开放申购</td><td>开放赎回</td><td class='red unbold'></td></tr></tbody></table>",records:1,pages:1,curpage:1};`;
    const result = FundValuesProto.deserialize(input);
    expect(result).toEqual({
      records: 1,
      pages: 1,
      curPage: 1,
      netValues: [
        {
          date: new Date('2017-02-01T07:00:00.000Z'),
          value: 2.109,
        },
        {
          date: new Date('2017-03-01T07:00:00.000Z'),
          value: 2.109,
        },
      ],
    });
  });

  it('returns empty net values if no data are found', () => {
    const input = `var apidata={ content:"<table class='w782 comm lsjz'><thead><tr><th class='first'>净值日期</th><th>单位净值</th><th>累计净值</th><th>日增长率</th><th>申购状态</th><th>赎回状态</th><th class='tor last'>分红送配</th></tr></thead><tbody><tr><td colspan='7' align='center'>暂无数据!</td></tr></tbody></table>",records:0,pages:0,curpage:1};`;
    const result = FundValuesProto.deserialize(input);
    expect(result).toEqual({
      records: 0,
      pages: 0,
      curPage: 1,
      netValues: [],
    });
  });
});
