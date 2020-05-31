import * as React from 'react';
import { computed } from 'mobx';
import SnackBar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import { observer } from 'mobx-react';
import { createHeader } from './header/header';
import { CNFundValueService } from '../services/subject-matter/fund-cn/fund-value-service';
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
  const fundValueService = new CNFundValueService();
  const appStore = new AppStore({ fundValueService });
  const subjectMatter = computed(() => appStore.subjectMatter);
  const fetchValues = async (id: string) => appStore.fetchValue(id);
  const makrups = computed(() => appStore.markups);
  const setMarkups = (markups: Markup[]) => appStore.setMarkups(markups);

  const Header = createHeader(fetchValues, subjectMatter);
  const KLine = createKLine(subjectMatter, makrups);
  const ControlPanel = createControlPanel(setMarkups, subjectMatter);
  return observer(() => (
    <App
      Header={Header}
      KLine={KLine}
      ControlPanel={ControlPanel}
      errorMessage={appStore.errorMessage}
    />
  ));
}
