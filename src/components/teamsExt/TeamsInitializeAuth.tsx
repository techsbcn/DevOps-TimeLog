import React, { useEffect, useState } from 'react';
import { _VALUES } from '../../resources/_constants/values';
import { CircularProgress, Box, Avatar } from '@mui/material';
import * as microsoftTeams from '@microsoft/teams-js';
import { Button } from '@fluentui/react-northstar';
import { GetTokenTL, GetProjectTL, GetOrganizationTL, GetValidationTOKEN } from '../../helpers';
import ChooseInfo from './ChooseInfo';
import { TeamsExtensionType } from '../../enums/TeamsExtensionType';
import loginImg from './../../../static/loginImg.png';
import CheckExtension from './CheckExtension';
import { ErrorIcon } from '@fluentui/react-icons-northstar';
interface TeamsInitializeAuthProps {
  extensionType: TeamsExtensionType;
}

const TeamsInitializeAuth: React.FC<TeamsInitializeAuthProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [accessToken, setAccessToken] = useState<any>();
  const [failureCallback, setFailureCallBack] = useState<boolean>(false);

  useEffect(() => {
    microsoftTeams.initialize();
    microsoftTeams.appInitialization.notifySuccess();
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
          setFailureCallBack(false);
          setLoading(false);
          microsoftTeams.authentication.notifySuccess(result);
        },
        failureCallback: (reason) => {
          console.log('Error', reason);
          if (reason === 'invalid_client') {
            setFailureCallBack(true);
          }
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
        <CheckExtension extensionType={props.extensionType} />
      ) : (
        <ChooseInfo extensionType={props.extensionType} />
      )
    ) : (
      <Box textAlign="center">
        {failureCallback && (
          <Box mb={2}>
            <Avatar
              src={loginImg}
              className="object-contain"
              alt="loginImg"
              variant="square"
              sx={{ height: '450px', width: '100%' }}
            />
            <Box mt={1} fontWeight="Bold" fontSize={20}>
              {_VALUES.UNABLE_ACCESS_TO_DEVOPS}
              <a className="afn" target="_blank" href={'https://dev.azure.com/'} rel="noreferrer">
                Azure DevOps
              </a>
              <Box>
                <ErrorIcon size="largest" />
              </Box>
            </Box>
          </Box>
        )}
        <Button primary content={failureCallback ? _VALUES.TRY_AGAIN : _VALUES.LOGIN} onClick={handleLogin} />
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
