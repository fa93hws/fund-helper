import * as React from 'react';
import { computed } from 'mobx';
import { createHeader } from './header/header';
import { HeaderStore } from './header/header-store';
import { FundValueService, FundValues } from '../services/fund-value-service';
import { createKLine } from './k-line/k-line';
import { AppStore } from './app-store';
import styles from './app.css';

type AppProps = {
  Header: React.ComponentType;
  KLine: React.ComponentType;
};
const App = React.memo(({ Header, KLine }: AppProps) => (
  <div>
    <Header />
    <div className={styles.kLineWrapper}>
      <KLine />
    </div>
  </div>
));

export function createApp() {
  const appStore = new AppStore();

  const setFundInfo = (info: FundValues) => appStore.setFundInfo(info);
  const fundValueService = new FundValueService();
  const headerStore = new HeaderStore({ fundValueService, setFundInfo });
  const Header = createHeader(headerStore);

  const fundValue = computed(() => appStore.fundInfo);
  const KLine = createKLine(fundValue);
  return () => <App Header={Header} KLine={KLine} />;
}
