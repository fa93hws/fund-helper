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
    for (let idx = this.entryPoint; idx < realValues.length; idx += 1) {
      const currentValue = realValues[idx];
      const maxValue = Math.max(
        ...realValues.slice(idx - this.entryPoint, idx),
      );
      const minValue = Math.min(...realValues.slice(idx - this.exitPoint, idx));
      if (hasBought && currentValue < minValue) {
        hasBought = false;
        markups.push({
          text: '卖',
          coord: [values[idx].date, values[idx].real_value],
          backgroundColor: 'blue',
        });
      } else if (!hasBought && currentValue > maxValue) {
        hasBought = true;
        markups.push({
          text: '买',
          coord: [values[idx].date, values[idx].real_value],
          backgroundColor: 'red',
        });
      }
    }
    return markups;
  }
}
