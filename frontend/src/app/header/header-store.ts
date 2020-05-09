import { observable, action } from 'mobx';
import {
  ErrorKind,
  ResultKind,
  CanFetchFundValue,
} from '../../services/fund-value-service';

export type FundInfo = {
  id: string;
  name: string;
  type: string;
};

export class HeaderStore {
  constructor(private readonly fundValueService: CanFetchFundValue) {}

  @observable.ref
  idInput = '';

  @observable.ref
  info: FundInfo | undefined = undefined;

  @observable.ref
  errorMessage: string | undefined = undefined;

  private alertTimer: number | undefined = undefined;

  @action
  setIdInput(input: string) {
    this.idInput = input;
  }

  @action
  setInfo(info: FundInfo) {
    this.info = info;
  }

  @action
  async fetchValue() {
    this.closeErrorAlert();
    const response = await this.fundValueService.fetchFundValues(this.idInput);
    if (response.kind === ResultKind.OK) {
      // eslint-disable-next-line
      console.log(response.data);
    } else {
      const errorMsg = this.getErrorMessage(response.errorKind, this.idInput);
      this.displayErrorMessage(errorMsg, 1000);
    }
  }

  private getErrorMessage(errorKind: ErrorKind, id: string): string {
    switch (errorKind) {
      case ErrorKind.NOT_FOUND:
        return `找不到基金ID=${id}`;
      case ErrorKind.REQUEST_FAIL:
        return '请求失败';
      case ErrorKind.UNKNOWN_ERROR:
        return '未知错误';
      default:
        // TODO Use unreachable exception
        throw new Error('unreachable code');
    }
  }

  private closeErrorAlert() {
    this.errorMessage = undefined;
    window.clearTimeout(this.alertTimer);
  }

  // timeout in ms
  private displayErrorMessage(message: string, timeout: number) {
    this.errorMessage = message;
    this.alertTimer = window.setTimeout(() => this.closeErrorAlert(), timeout);
  }
}
