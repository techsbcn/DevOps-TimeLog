import 'es6-promise/auto';
import { createRoot } from 'react-dom/client';
import './styles/Global.scss';
import store from './redux/store';
import { Provider } from 'react-redux';
import { Box } from '@mui/material';
import { initBackend } from 'absurd-sql/dist/indexeddb-main-thread';
import { MainLayoutSimple } from 'techsbcn-storybook';
import React from 'react';

export const initSQL = () => {
  const worker = new Worker(new URL('./index.worker.js', import.meta.url));
  initBackend(worker);
  return worker;
};

export const showRootComponent = (component: React.ReactElement<any>) => {
  const container = document.getElementById('root');

  container &&
    createRoot(container).render(
      <Provider store={store}>
        <MainLayoutSimple mainComponent={<Box mt={2}>{component}</Box>} />
      </Provider>
    );
};
