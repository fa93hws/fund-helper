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
});
