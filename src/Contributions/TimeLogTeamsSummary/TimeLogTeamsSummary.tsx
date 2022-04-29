import React, { useEffect, useState } from 'react';
import { showRootTeamsComponent } from '../..';
import { _VALUES } from '../../resources/_constants/values';
import { CircularProgress, Box } from '@mui/material';
import * as microsoftTeams from '@microsoft/teams-js';
import { Button } from '@fluentui/react-northstar';
import { GetTokenTL, GetProjectTL, GetOrganizationTL, GetValidationTOKEN } from '../../helpers';
import ChooseInfo from '../../components/teamsExt/ChooseInfo';
import TimeLogTeamsExt from '../../components/teamsExt/TimeLogTeamsExt';

export const TimeLogTeamsSummary: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [accessToken, setAccessToken] = useState<any>();
  microsoftTeams.initialize();
  useEffect(() => {
    GetValidationTOKEN().then((response) => {
      if (response) {
        setAccessToken(GetTokenTL());
        setLoading(false);
      } else {
        microsoftTeams.initialize(() => {
          microsoftTeams.authentication.authenticate({
            url: `${window.location.href.split('/dist')[0]}/dist/auth-start.html`,
            width: 600,
            height: 535,
            successCallback: (result: any) => {
              setAccessToken(result.accessToken);
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
    });
  }, []);

  const handleLogin = () => {
    microsoftTeams.authentication.authenticate({
      url: `${window.location.href.split('/dist')[0]}/dist/auth-start.html`,
      width: 600,
      height: 535,
      successCallback: (result: any) => {
        setAccessToken(result.accessToken);
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
        <TimeLogTeamsExt projectId={GetProjectTL()} organization={GetOrganizationTL()} token={accessToken} />
      ) : (
        <ChooseInfo />
      )
    ) : (
      <Box textAlign="center">
        <Button primary content={_VALUES.LOGIN} onClick={handleLogin} />
      </Box>
    )
  ) : (
    <Box textAlign="center" display="flex" alignItems="center" justifyContent="center">
      <CircularProgress className="circular-progress-main-color" />
      <Box ml={2}>{_VALUES.LOADING}...</Box>
    </Box>
  );
};

showRootTeamsComponent(<TimeLogTeamsSummary />);
