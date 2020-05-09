import { action, observable } from 'mobx';

export class HeaderStore {
  constructor(private readonly fetchValues: (id: string) => Promise<void>) {}

  @observable.ref
  idInput = '';

  @action
  setIdInput(input: string) {
    this.idInput = input;
  }

  @action
  async onSubmit() {
    await this.fetchValues(this.idInput);
  }
}
