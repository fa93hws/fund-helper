import { action, observable } from 'mobx';
import { CanFetchFundValue, FundValues } from '../services/fund-value-service';

export class AppStore {
  private readonly fundValueService: CanFetchFundValue;

  private readonly alertTimeout: number;

  private alertTimer: number | undefined = undefined;

  constructor({
    fundValueService,
    alertTimeout = 5000,
  }: {
    fundValueService: CanFetchFundValue;
    alertTimeout?: number;
  }) {
    this.fundValueService = fundValueService;
    this.alertTimeout = alertTimeout;
  }

  @observable.ref
  values: FundValues | undefined = undefined;

  @observable.ref
  errorMessage: string | undefined = undefined;

  @action
  async fetchValue(id: string) {
    this.closeErrorAlert();
    const response = await this.fundValueService.fetchFundValues(id);
    if (response.kind === 'ok') {
      this.values = response.data;
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
