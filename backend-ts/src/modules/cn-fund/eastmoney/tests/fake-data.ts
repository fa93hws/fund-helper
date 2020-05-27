import { FundType } from '../../values.dto';

export const fakeValueResponseRaw = `var apidata={ content:"<table><thead><tr><th>净值日期</th><th>单位净值</th><th>累计净值</th><th>日增长率</th><th>申购状态</th><th>赎回状态</th><th>分红送配</th></tr></thead><tbody><tr><td>2020-04-24</td><td>3.7510</td><td>3.7510</td><td>-1.16%</td><td>开放申购</td><td>开放赎回</td><td></td></tr><tr><td>2020-04-23</td><td>3.7950</td><td>3.7950</td><td>-1.07%</td><td>开放申购</td><td>开放赎回</td><td></td></tr></tbody></table>",records:2102,pages:211,curpage:4};`;
export const fakeValueResponseParsed = {
  values: [
    {
      date: new Date('2020-04-24T07:00:00.000Z'),
      value: 3.751,
    },
    {
      date: new Date('2020-04-23T07:00:00.000Z'),
      value: 3.795,
    },
  ],
  pages: 211,
  curPage: 4,
};

export const fakeListResponseRaw =
  'var r = [["000001","HXCZHH","华夏成长混合","混合型","HUAXIACHENGZHANGHUNHE"],["000002","HXCZHH","华夏成长混合(后端)","股票指数","HUAXIACHENGZHANGHUNHE"]];';
export const fakeListResponseParsed = [
  {
    id: '000001',
    name: '华夏成长混合',
    type: FundType.混合,
  },
  {
    id: '000002',
    name: '华夏成长混合(后端)',
    type: FundType.指数,
  },
];
