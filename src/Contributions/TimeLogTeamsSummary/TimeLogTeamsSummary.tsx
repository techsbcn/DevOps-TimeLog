import React, { useEffect, useState, createContext } from 'react';
import { showRootComponent } from '../..';
import { _VALUES } from '../../resources/_constants/values';
import { CircularProgress, Box } from '@mui/material';
import * as microsoftTeams from '@microsoft/teams-js';
import { useTeamsFx } from '@microsoft/teamsfx-react';
import { Button } from '@fluentui/react-northstar';
import { GetTokenTL, GetProjectTL, GetOrganizationTL } from '../../helpers';
import ChooseInfo from '../../components/teamsExt/ChooseInfo';
import TimeLogTeamsExt from '../../components/teamsExt/TimeLogTeamsExt';

export const TimeLogTeamsSummary: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<any>(GetTokenTL());
  microsoftTeams.initialize();
  /*useEffect(() => {
    if (!GetTokenTL()) {
      setLoading(true);
      microsoftTeams.initialize(() => {
        microsoftTeams.authentication.authenticate({
          url: `${process.env.URL_ORIGIN as string}/auth-start.html`,
          //url: 'https://localhost:44324/auth-start.html',
          width: 600,
          height: 535,
          successCallback: (result: any) => {
            setAccessToken(result.accessToken);
            console.log('AT', result.accessToken);
            localStorage.setItem('TL_TOKEN', JSON.stringify(result.accessToken));
            setLoading(false);
          },
          failureCallback: (reason) => {
            console.log('Error', reason);
            setLoading(false);
          },
        });
      });
    }
  }, []);*/

  const handleLogin = () => {
    microsoftTeams.authentication.authenticate({
      //url: `${process.env.URL_ORIGIN as string}/auth-start.html`,
      //url: 'https://localhost:44324/auth-start.html',
      url: `${window.location.href.split('/dist')[0]}/dist/auth-start.html`,
      width: 600,
      height: 535,
      successCallback: (result: any) => {
        setAccessToken(result.accessToken);
        console.log('AT', result.accessToken);
        localStorage.setItem('TL_TOKEN', JSON.stringify(result.accessToken));
      },
      failureCallback: (reason) => {
        console.log('Error', reason);
      },
    });
  };

  return !loading ? (
    accessToken ? (
      GetProjectTL() && GetOrganizationTL() ? (
        <TimeLogTeamsExt projectId={GetProjectTL()} organization={GetOrganizationTL()} />
      ) : (
        <ChooseInfo />
      )
    ) : (
      <Box textAlign="center">
        <Button primary content="Sign in" onClick={handleLogin} />
      </Box>
    )
  ) : (
    <Box textAlign="center" display="flex" alignItems="center" justifyContent="center">
      <CircularProgress className="circular-progress-main-color" />
      <Box ml={2}>{_VALUES.LOADING}...</Box>
    </Box>
  );
};

showRootComponent(<TimeLogTeamsSummary />);
