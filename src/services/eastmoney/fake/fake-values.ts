const countN = (n: number) => Array.from(new Array(n), (_, idx) => idx + 1);
export const fakeNetValues = [
  {
    curPage: 1,
    records: 50,
    pages: 3,
    netValues: countN(20).map(idx => ({
      date: new Date('2018-03-01').getTime() + idx * 24 * 3600 * 1000,
      value: idx + 30,
    })),
  },
  {
    curPage: 2,
    records: 50,
    pages: 3,
    netValues: countN(20).map(idx => ({
      date: new Date('2018-02-01').getTime() + idx * 24 * 3600 * 1000,
      value: idx + 10,
    })),
  },
  {
    curPage: 3,
    records: 50,
    pages: 3,
    netValues: countN(10).map(idx => ({
      date: new Date('2018-01-01').getTime() + idx * 24 * 3600 * 1000,
      value: idx,
    })),
  },
];
