import React, { useEffect, useState } from 'react';
import { UserContext } from '../../interfaces';
import { GetPublicAlias } from '../../redux/profile/profileAPI';
import { CircularProgress, Box } from '@mui/material';
import TimeLogMainSummary from '../../components/timeLogSummary/TimeLogMainSummary';
import { _VALUES } from '../../resources/_constants/values';
import { GetWebApi } from '../../redux/apiSlice';
import * as vm from 'azure-devops-node-api';
import * as lim from 'azure-devops-node-api/interfaces/LocationsInterfaces';

interface TimeLogTeamsExtProps {
  projectId: string;
  organization: string;
  token: string;
}

const TimeLogTeamsExt: React.FC<TimeLogTeamsExtProps> = (props) => {
  const [user, setUser] = useState<UserContext>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    GetWebApi(props.token, `https://dev.azure.com/${props.organization}`).then(async (webApi: vm.WebApi) => {
      const connData: lim.ConnectionData = await webApi.connect();
      connData &&
        connData.authenticatedUser &&
        setUser({ id: connData.authenticatedUser.id, displayName: connData.authenticatedUser.customDisplayName });

      setLoading(false);
    });
  }, [props.organization, props.token]);

  return !loading ? (
    <TimeLogMainSummary documents={[]} loadingDocuments={false} user={user} projectId={props.projectId} />
  ) : (
    <Box textAlign="center" display="flex" alignItems="center" justifyContent="center">
      <CircularProgress className="circular-progress-main-color" />
      <Box ml={2}>{_VALUES.LOADING}...</Box>
    </Box>
  );
};

export default TimeLogTeamsExt;
