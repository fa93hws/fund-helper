import { observable, action } from 'mobx';
import { CanFetchFundValue } from '../../services/fund-value-service';

export type FundInfo = {
  id: string;
  name: string;
  type: string;
};

export class HeaderStore {
  constructor(
    private readonly fundValueService: CanFetchFundValue,
    private readonly alertTimeout: number = 5000,
  ) {}

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
    if (response.kind === 'ok') {
      // eslint-disable-next-line
      console.log(response.data);
    } else {
      this.displayErrorMessage(response.error.message, this.alertTimeout);
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
