import { action, observable } from 'mobx';
import { Markup } from '../k-line/plot/plot';
import type { SubjectMatterValue } from '../../services/subject-matter/subject-matter';

export class ControlPanelStore {
  @observable.ref entryPoint = 50;

  @observable.ref exitPoint = 10;

  @action setEntryPoint(point: number) {
    this.entryPoint = point;
  }

  @action setExitPoint(point: number) {
    this.exitPoint = point;
  }

  calculateMarkupsOnGiven({ values }: { values: SubjectMatterValue[] }) {
    const buyPoints = [
      0,
      100,
      207,
      303,
      895,
      1244,
      1524,
      1542,
      1564,
      1662,
      1679,
      2246,
      2380,
      2459,
      2689,
    ];
    const sellPoints = [
      80,
      164,
      249,
      466,
      1103,
      1506,
      1535,
      1552,
      1617,
      1674,
      1769,
      2269,
      2440,
      2656,
      2712,
    ];
    const markups: Markup[] = [];
    const result = {
      money: 100,
      buyCount: 0,
    };
    for (let idx = 0; idx < buyPoints.length; idx += 1) {
      const buyIdx = buyPoints[idx];
      markups.push({
        text: '买',
        coord: [values[buyIdx].time, values[buyIdx].value],
        backgroundColor: 'red',
      });
      const sellIdx = sellPoints[idx];
      markups.push({
        text: '卖',
        coord: [values[sellIdx].time, values[sellIdx].value],
        backgroundColor: 'blue',
      });
      result.money =
        (result.money * values[sellIdx].value) / values[buyIdx].value;
    }
    // eslint-disable-next-line
    console.log({
      yearCount: values.length / 250,
      buyCount: buyPoints.length,
      money: result.money,
    });
    return markups;
  }

  calculateMarkups({ values }: { values: SubjectMatterValue[] }) {
    const markups: Markup[] = [];
    const realValues = values.map((v) => v.value);
    let hasBought = false;
    const result = {
      money: 100,
      share: 0,
      buyCount: 0,
    };
    for (let idx = this.entryPoint; idx < realValues.length; idx += 1) {
      const currentValue = realValues[idx];
      const maxValue = Math.max(
        ...realValues.slice(idx - this.entryPoint, idx),
      );
      const minValue = Math.min(...realValues.slice(idx - this.exitPoint, idx));
      if (maxValue <= minValue * 1.05) {
        continue;
      }
      if (hasBought && currentValue < minValue) {
        hasBought = false;
        result.buyCount += 1;
        result.money = currentValue * result.share;
        result.share = 0;
        markups.push({
          text: '卖',
          coord: [values[idx].time, values[idx].value],
          backgroundColor: 'blue',
        });
      } else if (!hasBought && currentValue > maxValue) {
        hasBought = true;
        result.buyCount += 1;
        result.share = result.money / currentValue;
        result.money = 0;
        markups.push({
          text: '买',
          coord: [values[idx].time, values[idx].value],
          backgroundColor: 'red',
        });
      }
    }
    // eslint-disable-next-line no-console
    console.log({
      yearCount: values.length / 250,
      buyCount: result.buyCount,
      money:
        result.money === 0
          ? result.share * realValues[realValues.length - 1]
          : result.money,
    });
    return markups;
  }
}
