import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { createApp } from './app/app';

const App = createApp();
ReactDOM.render(<App />, document.getElementById('root'));
