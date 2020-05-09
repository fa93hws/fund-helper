import * as React from 'react';
import { createHeader } from './header/header';
import { FundValueService } from '../services/fund-value-service';
import './app.css';

type AppProps = {
  Header: React.ComponentType;
};
const App = React.memo(({ Header }: AppProps) => <Header />);

export function createApp() {
  const fundValueService = new FundValueService();
  const Header = createHeader(fundValueService);
  return () => <App Header={Header} />;
}
