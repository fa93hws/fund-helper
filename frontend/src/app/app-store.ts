import { action, observable } from 'mobx';
import { CanFetchFundValue } from '../services/fund-cn/fund-value-service';
import { FundValueWithInfoCN } from '../services/fund-cn/fund-cn.proto';
import { Markup } from './k-line/plot/plot';

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

  @observable.ref valuesAndInfo: FundValueWithInfoCN | undefined = undefined;

  @observable.ref errorMessage: string | undefined = undefined;

  @observable.ref markups: Markup[] = [];

  @action async fetchValue(id: string) {
    this.closeErrorAlert();
    const response = await this.fundValueService.fetchFundValues(id);
    if (response.kind === 'ok') {
      this.valuesAndInfo = response.data;
    } else {
      this.displayErrorMessage(response.error.message, this.alertTimeout);
    }
  }

  @action setMarkups(markups: Markup[]) {
    this.markups = markups;
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
