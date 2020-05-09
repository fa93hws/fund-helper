import { action, observable } from 'mobx';
import { FundValues } from '../services/fund-value-service';

export class AppStore {
  @observable.ref
  fundInfo: FundValues | undefined = undefined;

  @action
  setFundInfo(fundInfo: FundValues) {
    this.fundInfo = fundInfo;
  }
}
