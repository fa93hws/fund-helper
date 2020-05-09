import { observable, action } from 'mobx';

export type FundInfo = {
  id: string;
  name: string;
  type: string;
};

export class HeaderStore {
  @observable.ref
  idInput = '';

  @observable.ref
  info: FundInfo | undefined = undefined;

  @action
  setIdInput(input: string) {
    this.idInput = input;
  }

  @action
  setInfo(info: FundInfo) {
    this.info = info;
  }
}
