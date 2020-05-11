import { action, observable } from 'mobx';
import { FundValues } from '../../services/fund-value-service';
import { Markup } from '../k-line/plot/plot';

export class ControlPanelStore {
  @observable.ref entryPoint = 50;

  @observable.ref exitPoint = 10;

  @action setEntryPoint(point: number) {
    this.entryPoint = point;
  }

  @action setExitPoint(point: number) {
    this.exitPoint = point;
  }

  calculateMarkups({ values }: FundValues) {
    const markups: Markup[] = [];
    const realValues = values.map((v) => v.real_value);
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
          coord: [values[idx].date, values[idx].real_value],
          backgroundColor: 'blue',
        });
      } else if (!hasBought && currentValue > maxValue) {
        hasBought = true;
        result.buyCount += 1;
        result.share = result.money / currentValue;
        result.money = 0;
        markups.push({
          text: '买',
          coord: [values[idx].date, values[idx].real_value],
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
