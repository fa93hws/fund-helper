/**
 * Control which parameters are calculated
 */

export interface MetricsConfig {
  /**
   * The min value from the previous n trading day
   */
  min?: readonly number[];

  /**
   * The max value from the previous n trading day
   */
  max?: readonly number[];
}

/**
 * Paramaters to calculate the optimal buy/sell points
 */
export interface OptimalPointsConfig {
  /**
   * Only consider profits larget than this
   * 0.3 = 30%
   */
  minProfit: number;

  /**
   * Values within the optimal point +- range% will be considered
   * as buy/sell point
   * 0.05 = 5%
   */
  range: number;

  /**
   * Values out of optimal point +- range Day will not be considered
   * as buy/sell point, even thought they are within the range in terms
   * of the value
   */
  rangeDay: number;
}

export interface ParamsConfig {
  metrics: MetricsConfig;
  optimalPoints: OptimalPointsConfig;
}
