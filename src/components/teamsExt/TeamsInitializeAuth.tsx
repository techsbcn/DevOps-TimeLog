import React, { useEffect, useState } from 'react';
import { _VALUES } from '../../resources/_constants/values';
import { CircularProgress, Box } from '@mui/material';
import * as microsoftTeams from '@microsoft/teams-js';
import { Button } from '@fluentui/react-northstar';
import { GetTokenTL, GetProjectTL, GetOrganizationTL, GetValidationTOKEN } from '../../helpers';
import ChooseInfo from './ChooseInfo';
import TimeLogTeamsExt from './TimeLogTeamsExt';
import { TeamsExtensionType } from '../../enums/TeamsExtensionType';

interface TeamsInitializeAuthProps {
  extensionType: TeamsExtensionType;
}

const TeamsInitializeAuth: React.FC<TeamsInitializeAuthProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [accessToken, setAccessToken] = useState<any>();
  useEffect(() => {
    GetValidationTOKEN().then((response) => {
      if (response) {
        setAccessToken(GetTokenTL());
        setLoading(false);
      } else {
        handleLogin();
      }
    });
  }, []);

  const handleLogin = () => {
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
  };

  return !loading ? (
    accessToken ? (
      props.extensionType === TeamsExtensionType.config ? (
        <ChooseInfo extensionType={props.extensionType} />
      ) : GetProjectTL() && GetOrganizationTL() ? (
        <TimeLogTeamsExt
          projectId={GetProjectTL()}
          organization={GetOrganizationTL()}
          token={accessToken}
          extensionType={props.extensionType}
        />
      ) : (
        <ChooseInfo extensionType={props.extensionType} />
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

export default TeamsInitializeAuth;
