import * as React from 'react';
import { computed } from 'mobx';
import SnackBar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import { observer } from 'mobx-react';
import { createHeader } from './header/header';
import { FundValueService } from '../services/fund-value-service';
import { createKLine } from './k-line/k-line';
import { AppStore } from './app-store';
import styles from './app.css';

type AppProps = {
  Header: React.ComponentType;
  KLine: React.ComponentType;
  errorMessage: string | undefined;
};
const App = React.memo(({ Header, KLine, errorMessage }: AppProps) => (
  <div>
    <SnackBar
      open={errorMessage != null}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity="error">{errorMessage}</Alert>
    </SnackBar>
    <Header />
    <div className={styles.kLineWrapper}>
      <KLine />
    </div>
  </div>
));

export function createApp() {
  const fundValueService = new FundValueService();
  const appStore = new AppStore({ fundValueService });
  const values = computed(() => appStore.values);
  const fetchValues = async (id: string) => appStore.fetchValue(id);

  const Header = createHeader(fetchValues, values);
  const KLine = createKLine(values);
  return observer(() => (
    <App Header={Header} KLine={KLine} errorMessage={appStore.errorMessage} />
  ));
}
