import 'es6-promise/auto';
import { createRoot } from 'react-dom/client';
import './styles/Global.scss';
import store from './redux/store';
import { Provider } from 'react-redux';
import { Box } from '@mui/material';
import { initBackend } from 'absurd-sql/dist/indexeddb-main-thread';
import { MainLayoutSimple } from 'techsbcn-storybook';
import React, { createContext } from 'react';
import { useTeamsFx } from '@microsoft/teamsfx-react';
import { Provider as ProviderFluent, teamsTheme, ThemePrepared } from '@fluentui/react-northstar';
import { TeamsFx } from '@microsoft/teamsfx';
import NavbarTechsbcnPoweredComponent from './components/shared/NavbarTechsbcnPoweredComponent';

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
        <MainLayoutSimple
          mainComponent={
            <>
              <NavbarTechsbcnPoweredComponent />
              <Box mb={2}>{component}</Box>
            </>
          }
        />
      </Provider>
    );
};

export const TeamsFxContext = createContext<{
  theme?: ThemePrepared;
  themeString: string;
  teamsfx?: TeamsFx;
}>({
  theme: undefined,
  themeString: '',
  teamsfx: undefined,
});

export const showRootTeamsComponent = (component: React.ReactElement<any>, noMargin?: boolean) => {
  const container = document.getElementById('root');

  container &&
    createRoot(container).render(
      <Provider store={store}>
        <TeamsContext component={component} noMargin={noMargin} />
      </Provider>
    );
};

function TeamsContext({ component, noMargin }: { component: React.ReactElement<any>; noMargin?: boolean }) {
  const { theme, themeString, teamsfx } = useTeamsFx();
  return (
    <TeamsFxContext.Provider value={{ theme, themeString, teamsfx }}>
      <ProviderFluent theme={theme || teamsTheme}>
        <MainLayoutSimple
          mainComponent={
            <Box className={themeString === 'default' ? '' : 'dark'} my={!noMargin ? 2 : 0}>
              {component}
            </Box>
          }
        />
      </ProviderFluent>
    </TeamsFxContext.Provider>
  );
}
