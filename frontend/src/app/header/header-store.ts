import { action, observable } from 'mobx';
import {
  CanFetchFundValue,
  FundValues,
} from '../../services/fund-value-service';

export type FundInfo = {
  id: string;
  name: string;
  type: string;
};

export class HeaderStore {
  private readonly fundValueService: CanFetchFundValue;

  private readonly alertTimeout: number;

  private readonly setFundInfo: (info: FundValues) => void;

  @observable.ref
  idInput = '';

  @observable.ref
  info: FundInfo | undefined = undefined;

  @observable.ref
  errorMessage: string | undefined = undefined;

  private alertTimer: number | undefined = undefined;

  constructor({
    fundValueService,
    alertTimeout = 5000,
    setFundInfo,
  }: {
    fundValueService: CanFetchFundValue;
    alertTimeout?: number;
    setFundInfo: (info: FundValues) => void;
  }) {
    this.fundValueService = fundValueService;
    this.alertTimeout = alertTimeout;
    this.setFundInfo = setFundInfo;
  }

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
      const { data } = response;
      this.setInfo({ id: data.id, name: data.name, type: data.type });
      this.setFundInfo(data);
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
