export type FundValue = {
  date: Date;
  value: number;
};

export const enum FundType {
  '混合' = '混合',
  '股票' = '股票',
  '债券' = '债券',
  '指数' = '指数',
  '其他' = '其他',
}

export type FundBasicInfo = {
  id: string;
  name: string;
  type: FundType;
};
