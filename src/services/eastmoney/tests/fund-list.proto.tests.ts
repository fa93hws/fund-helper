import { FundListProto } from '../fund-list.proto';

describe('FundListProto', () => {
  it('deserialize fund list correctly', () => {
    const input = `var r = [["000001","HXCZHH","华夏成长混合","混合型","HUAXIACHENGZHANGHUNHE"],["000002","HXCZHH","华夏成长混合(后端)","混合型","HUAXIACHENGZHANGHUNHE"]]`;
    const result = FundListProto.deserialize(input);
    expect(result).toEqual(
      new FundListProto({
        '000001': {
          abbr: 'HXCZHH',
          name: '华夏成长混合',
          type: '混合型',
          pinyin: 'HUAXIACHENGZHANGHUNHE',
        },
        '000002': {
          abbr: 'HXCZHH',
          name: '华夏成长混合(后端)',
          type: '混合型',
          pinyin: 'HUAXIACHENGZHANGHUNHE',
        },
      }),
    );
  });

  it('throws if first item is not string', () => {
    const input = `var r = [[1,"HXCZHH","华夏成长混合","混合型","HUAXIACHENGZHANGHUNHE"]]`;
    expect(() =>
      FundListProto.deserialize(input),
    ).toThrowErrorMatchingInlineSnapshot(
      `"item in fund info must be string, got number"`,
    );
  });

  it('throws if second item is not string', () => {
    const input = `var r = [["000001","HXCZHH",1,"混合型","HUAXIACHENGZHANGHUNHE"]]`;
    expect(() =>
      FundListProto.deserialize(input),
    ).toThrowErrorMatchingInlineSnapshot(
      `"item in fund info must be string, got number"`,
    );
  });

  it('throws if third item is not string', () => {
    const input = `var r = [["000001","HXCZHH","华夏成长混合",1,"HUAXIACHENGZHANGHUNHE"]]`;
    expect(() =>
      FundListProto.deserialize(input),
    ).toThrowErrorMatchingInlineSnapshot(
      `"item in fund info must be string, got number"`,
    );
  });

  it('throws if forth item is not string', () => {
    const input = `var r = [["000001","HXCZHH","华夏成长混合",{ a: 1, b: 2 },"HUAXIACHENGZHANGHUNHE"]]`;
    expect(() =>
      FundListProto.deserialize(input),
    ).toThrowErrorMatchingInlineSnapshot(
      `"item in fund info must be string, got object"`,
    );
  });

  it('throws if fifth item is not string', () => {
    const input = `var r = [["000001","HXCZHH","华夏成长混合","混合型",false]]`;
    expect(() =>
      FundListProto.deserialize(input),
    ).toThrowErrorMatchingInlineSnapshot(
      `"item in fund info must be string, got boolean"`,
    );
  });

  it('throws if there are six items in the list', () => {
    const input = `var r = [["000001","HXCZHH","华夏成长混合","混合型","HUAXIACHENGZHANGHUNHE", false]]`;
    expect(() =>
      FundListProto.deserialize(input),
    ).toThrowErrorMatchingInlineSnapshot(`"fund info must have 5 elements"`);
  });

  it('throws if fund info is not a list', () => {
    const input = `var r = ["000001","HXCZHH","华夏成长混合","混合型",false]`;
    expect(() =>
      FundListProto.deserialize(input),
    ).toThrowErrorMatchingInlineSnapshot(`"fund info must be in array"`);
  });

  it('throws if fund list is not a list', () => {
    const input = `var r = "000001"`;
    expect(() =>
      FundListProto.deserialize(input),
    ).toThrowErrorMatchingInlineSnapshot(`"expect fund list is an array"`);
  });
});
