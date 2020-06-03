import type { OptimalPointsConfig } from '../interfaces/params-config.interface';
import type { SubjectMatter } from '../interfaces/subject-matter.interface';

export type OptimalPoints = {
  // index;
  buy: number[];
  // index;
  sell: number[];
};

function findOneBuyPoint({
  values,
  startIdx,
  minProfit,
}: {
  values: number[];
  startIdx: number;
  minProfit: number;
  // lowestIdx, potentialSellIdx
}): [number, number] | undefined {
  let lowestIdx = startIdx;
  for (let idx = startIdx; idx < values.length; idx += 1) {
    if (values[idx] < values[lowestIdx]) {
      lowestIdx = idx;
    } else if (values[idx] > values[lowestIdx] * (1 + minProfit)) {
      return [lowestIdx, idx];
    }
  }
  return undefined;
}

function findOneSellPoint({
  values,
  startIdx,
  minProfit,
}: {
  values: number[];
  startIdx: number;
  minProfit: number;
  // highestIdx, potentialBuyIdx
}): [number, number] {
  let highestIdx = startIdx;
  for (let idx = startIdx; idx < values.length; idx += 1) {
    if (values[idx] > values[highestIdx]) {
      highestIdx = idx;
    } else if (values[idx] < values[highestIdx] * (1 - minProfit)) {
      return [highestIdx, idx];
    }
  }
  return [highestIdx, values.length - 1];
}

export function calculateOptimalPoints(
  subjectMatter: SubjectMatter,
  optimalPointsConfig: OptimalPointsConfig,
): OptimalPoints {
  const { minProfit } = optimalPointsConfig;
  const values = subjectMatter.values.map((v) => v.value);
  const optimalPoints: OptimalPoints = { buy: [], sell: [] };
  let idx = 0;
  while (idx < values.length - 1) {
    const buyPointData = findOneBuyPoint({ values, startIdx: idx, minProfit });
    if (buyPointData == null) {
      break;
    }
    const [buyPoint, potentialSellPoint] = buyPointData;
    const [sellPonit, potentialBuyPoint] = findOneSellPoint({
      values,
      startIdx: potentialSellPoint,
      minProfit,
    });
    optimalPoints.buy.push(buyPoint);
    optimalPoints.sell.push(sellPonit);
    idx = potentialBuyPoint;
  }
  return optimalPoints;
}
