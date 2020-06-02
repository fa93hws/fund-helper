import { action, observable } from 'mobx';
import type {
  SubjectMatter,
  CanFetchSubjectMatter,
} from '../services/subject-matter/subject-matter';
import type { Markup } from './k-line/plot/plot';

export class AppStore {
  private readonly fundValueService: CanFetchSubjectMatter;

  private readonly alertTimeout: number;

  private alertTimer: number | undefined = undefined;

  constructor({
    fundValueService,
    alertTimeout = 5000,
  }: {
    fundValueService: CanFetchSubjectMatter;
    alertTimeout?: number;
  }) {
    this.fundValueService = fundValueService;
    this.alertTimeout = alertTimeout;
  }

  @observable.ref subjectMatter: SubjectMatter | undefined;

  @observable.ref errorMessage: string | undefined;

  @observable.ref markups: Markup[] = [];

  @action async fetchValue(id: string): Promise<void> {
    this.closeErrorAlert();
    const response = await this.fundValueService.fetchSubjectMatter(id);
    if (response.kind === 'ok') {
      this.subjectMatter = response.data;
    } else {
      const errorMessage = response.error?.message ?? '未知错误';
      this.displayErrorMessage(errorMessage, this.alertTimeout);
    }
  }

  @action setMarkups(markups: Markup[]): void {
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
