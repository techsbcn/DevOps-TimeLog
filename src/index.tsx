import 'azure-devops-ui/Core/override.css';
import 'es6-promise/auto';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './styles/Global.scss';
import store from './redux/store';
import { Provider } from 'react-redux';
import { Box } from '@mui/material';
import { initBackend } from 'absurd-sql/dist/indexeddb-main-thread';

export function initSQL() {
  const worker = new Worker(new URL('./index.worker.js', import.meta.url));
  initBackend(worker);
  return worker;
}

export function initSQL2() {
  const worker = new Worker(new URL('index.worker.js', import.meta.url));
  initBackend(worker);
  return worker;
}

export function showRootComponent(component: React.ReactElement<any>) {
  ReactDOM.render(
    <Provider store={store}>
      <Box mt={2}>{component}</Box>
    </Provider>,
    document.getElementById('root')
  );
}
