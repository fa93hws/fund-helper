export type FundValueCN = {
  time: Date;
  value: number;
};

export const enum FundTypeCN {
  "混合" = "混合",
  "股票" = "股票",
  "债券" = "债券",
  "指数" = "指数",
  "其他" = "其他",
}

export type FundBasicInfoCN = {
  id: string;
  name: string;
  type: FundTypeCN;
};

export type FundValueWithInfoCN = {
  values: FundValueCN[];
  info: FundBasicInfoCN;
};
