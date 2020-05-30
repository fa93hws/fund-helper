export type FundCNValue = {
  date: Date;
  value: number;
};

export const enum FundCNType {
  '混合' = '混合',
  '股票' = '股票',
  '债券' = '债券',
  '指数' = '指数',
  '其他' = '其他',
}

export type FundCNBasicInfo = {
  id: string;
  name: string;
  type: FundCNType;
};

export type FundCNValueResponse = {
  values: FundCNValue[];
  info: FundCNBasicInfo;
};
