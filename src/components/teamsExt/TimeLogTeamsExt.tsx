import React, { useEffect, useState } from 'react';
import { UserContext } from '../../interfaces';
import { CircularProgress, Box } from '@mui/material';
import TimeLogMainSummary from '../../components/timeLogSummary/TimeLogMainSummary';
import { _VALUES } from '../../resources/_constants/values';
import { useFetchGetDocumentsWithoutFiltersQuery } from '../../redux/extensionDataManager/extensionDataManagerSlice';
import { GetWebApi } from '../../redux/apiSlice';
import * as vm from 'azure-devops-node-api';
import * as lim from 'azure-devops-node-api/interfaces/LocationsInterfaces';
import { TeamsExtensionType } from '../../enums/TeamsExtensionType';
import TimeLogNewEntriesExternalForm from '../../components/timeLogEntries/forms/TimeLogNewEntriesExternalForm';
import TimeLogDashboard from '../timeLogDashboard/TimeLogDashboard';

interface TimeLogTeamsExtProps {
  extensionType: TeamsExtensionType;
}

const TimeLogTeamsExt: React.FC<TimeLogTeamsExtProps> = (props) => {
  const [user, setUser] = useState<UserContext>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    GetWebApi().then(async (webApi: vm.WebApi) => {
      const connData: lim.ConnectionData = await webApi.connect();
      connData &&
        connData.authenticatedUser &&
        connData.authenticatedUser.id &&
        setUser({
          id: connData.authenticatedUser.id,
          displayName:
            connData.authenticatedUser.customDisplayName ?? connData.authenticatedUser.providerDisplayName ?? '',
        });
      setLoading(false);
    });
  }, []);

  const useFetchDocuments = useFetchGetDocumentsWithoutFiltersQuery({
    collectionName: process.env.ENTRIES_COLLECTION_NAME as string,
    useAPIExtension: true,
  });

  return !loading ? (
    props.extensionType === TeamsExtensionType.summary ? (
      <TimeLogMainSummary
        documents={
          useFetchDocuments.data && useFetchDocuments.data.items.length > 0 ? useFetchDocuments.data.items : []
        }
        loadingDocuments={useFetchDocuments.isFetching}
        user={user}
      />
    ) : props.extensionType === TeamsExtensionType.newTimeLog && user ? (
      <TimeLogNewEntriesExternalForm user={user} />
    ) : props.extensionType === TeamsExtensionType.dashboard ? (
      <TimeLogDashboard
        documents={
          useFetchDocuments.data && useFetchDocuments.data.items.length > 0 ? useFetchDocuments.data.items : []
        }
        loadingDocuments={useFetchDocuments.isFetching}
      />
    ) : (
      <></>
    )
  ) : (
    <Box textAlign="center" display="flex" alignItems="center" justifyContent="center">
      <CircularProgress className="circular-progress-main-color" />
      <Box ml={2}>{_VALUES.LOADING}...</Box>
    </Box>
  );
};

export default TimeLogTeamsExt;
