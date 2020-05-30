import * as React from 'react';
import { computed } from 'mobx';
import SnackBar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import { observer } from 'mobx-react';
import { createHeader } from './header/header';
import { FundValueService } from '../services/fund-cn/fund-value-service';
import { createKLine } from './k-line/k-line';
import { createControlPanel } from './control/control';
import { AppStore } from './app-store';
import { Markup } from './k-line/plot/plot';
import './app.css';

type AppProps = {
  ControlPanel: React.ComponentType;
  Header: React.ComponentType;
  KLine: React.ComponentType;
  errorMessage: string | undefined;
};
const App = React.memo(
  ({ Header, KLine, errorMessage, ControlPanel }: AppProps) => (
    <div>
      <SnackBar
        open={errorMessage != null}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error">{errorMessage}</Alert>
      </SnackBar>
      <Header />
      <ControlPanel />
      <KLine />
    </div>
  ),
);

export function createApp() {
  const fundValueService = new FundValueService();
  const appStore = new AppStore({ fundValueService });
  const valueWithInfo = computed(() => appStore.valuesAndInfo);
  const info = computed(() => valueWithInfo.get()?.info);
  const fetchValues = async (id: string) => appStore.fetchValue(id);
  const makrups = computed(() => appStore.markups);
  const setMarkups = (markups: Markup[]) => appStore.setMarkups(markups);

  const Header = createHeader(fetchValues, info);
  const KLine = createKLine(valueWithInfo, makrups);
  const ControlPanel = createControlPanel(setMarkups, valueWithInfo);
  return observer(() => (
    <App
      Header={Header}
      KLine={KLine}
      ControlPanel={ControlPanel}
      errorMessage={appStore.errorMessage}
    />
  ));
}
