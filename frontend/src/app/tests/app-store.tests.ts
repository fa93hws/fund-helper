import { AppStore } from '../app-store';
import { FundValues } from '../../services/fund-value-service';

describe('AppStore', () => {
  it('has the following default value', () => {
    const store = new AppStore();
    expect(store.fundInfo).toBeUndefined();
  });

  it('sets the fund info', () => {
    const store = new AppStore();
    const fundInfo: FundValues = {
      id: 'hanasaki',
      name: 'guming',
      type: 'crystal',
      values: [],
    };
    store.setFundInfo(fundInfo);
    expect(store.fundInfo).toEqual({
      id: 'hanasaki',
      name: 'guming',
      type: 'crystal',
      values: [],
    });
  });
});
