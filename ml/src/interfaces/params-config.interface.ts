/**
 * Control which parameters are calculated
 */
export interface ParamsConfig {
  /**
   * The min value from the previous n trading day
   */
  min?: readonly number[];

  /**
   * The max value from the previous n trading day
   */
  max?: readonly number[];
}
