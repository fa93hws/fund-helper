import { ParamsConfig } from '../src/interfaces/params-config.interface';

const config: ParamsConfig = {
  metrics: {
    max: [50],
    min: [10],
  },
  optimalPoints: {
    minProfit: 0.1,
    range: 0.05,
    rangeDay: 7,
  },
};

export = config;
