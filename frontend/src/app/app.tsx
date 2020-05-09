import * as React from 'react';
import { createHeader } from './header/header';
import './app.css';

type AppProps = {
  Header: React.ComponentType;
};
const App = React.memo(({ Header }: AppProps) => <Header />);

export function createApp() {
  const Header = createHeader();
  return () => <App Header={Header} />;
}
