import React, { useEffect, useState } from 'react';
import { UserContext } from '../../interfaces';
import { CircularProgress, Box } from '@mui/material';
import TimeLogMainSummary from '../../components/timeLogSummary/TimeLogMainSummary';
import { _VALUES } from '../../resources/_constants/values';
import { GetWebApi } from '../../redux/apiSlice';
import * as vm from 'azure-devops-node-api';
import * as lim from 'azure-devops-node-api/interfaces/LocationsInterfaces';
import { useFetchGetDocumentsWithoutFiltersQuery } from '../../redux/extensionDataManager/extensionDataManagerSlice';

interface TimeLogTeamsExtProps {
  projectId: string;
  organization: string;
  token: string;
}

const TimeLogTeamsExt: React.FC<TimeLogTeamsExtProps> = (props) => {
  const [user, setUser] = useState<UserContext>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    GetWebApi().then(async (webApi: vm.WebApi) => {
      const connData: lim.ConnectionData = await webApi.connect();
      connData &&
        connData.authenticatedUser &&
        setUser({ id: connData.authenticatedUser.id, displayName: connData.authenticatedUser.customDisplayName });

      setLoading(false);
    });
  }, [props.organization, props.token]);

  const useFetchDocuments = useFetchGetDocumentsWithoutFiltersQuery({
    collectionName: process.env.ENTRIES_COLLECTION_NAME as string,
    useAPIExtension: true,
  });

  return !loading ? (
    <TimeLogMainSummary
      documents={useFetchDocuments.data && useFetchDocuments.data.items.length > 0 ? useFetchDocuments.data.items : []}
      loadingDocuments={useFetchDocuments.isFetching}
      user={user}
      projectId={props.projectId}
    />
  ) : (
    <Box textAlign="center" display="flex" alignItems="center" justifyContent="center">
      <CircularProgress className="circular-progress-main-color" />
      <Box ml={2}>{_VALUES.LOADING}...</Box>
    </Box>
  );
};

export default TimeLogTeamsExt;
