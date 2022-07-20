import React, { useEffect, useState } from 'react';
import * as SDK from 'azure-devops-extension-sdk';
import { showRootComponent } from '../..';
import { useFetchGetDocumentsWithoutFiltersQuery } from '../../redux/extensionDataManager/extensionDataManagerSlice';
import TimeLogMainSummary from '../../components/timeLogSummary/TimeLogMainSummary';
import { CircularProgress, Box } from '@mui/material';
import { _VALUES } from '../../resources/_constants/values';
import { GetProjectContext } from '../../redux/core/coreAPI';

export const TimeLogDevOpsSummary: React.FC = () => {
  const [user, setUser] = useState<SDK.IUserContext>();
  const [loading, setLoading] = useState<boolean>(true);
  const [urlWorkItem, setUrlWorkItem] = useState<string>();
  useEffect(() => {
    setLoading(true);
    SDK.init().then(async () => {
      SDK.register(SDK.getContributionId(), () => {});
      await SDK.ready();
      const user = SDK.getUser();
      const pId = (await GetProjectContext()).id;
      const host = SDK.getHost().name;
      setUrlWorkItem(`https://dev.azure.com/${host}/${pId}/_workitems/edit`);
      setUser(user);
      setLoading(false);
    });
  }, []);

  const useFetchDocuments = useFetchGetDocumentsWithoutFiltersQuery({
    collectionName: process.env.ENTRIES_COLLECTION_NAME as string,
  });

  return !loading ? (
    <TimeLogMainSummary
      documents={useFetchDocuments.data && useFetchDocuments.data.items.length > 0 ? useFetchDocuments.data.items : []}
      loadingDocuments={useFetchDocuments.isFetching}
      user={user}
      urlWorkItem={urlWorkItem}
    />
  ) : (
    <Box textAlign="center" display="flex" alignItems="center" justifyContent="center">
      <CircularProgress className="circular-progress-main-color" />
      <Box ml={2}>{_VALUES.LOADING}...</Box>
    </Box>
  );
};
showRootComponent(<TimeLogDevOpsSummary />);
