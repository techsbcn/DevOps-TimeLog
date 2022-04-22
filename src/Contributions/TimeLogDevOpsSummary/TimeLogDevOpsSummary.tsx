import React, { useEffect, useState } from 'react';
import * as SDK from 'azure-devops-extension-sdk';
import { showRootComponent } from '../..';
import { useFetchGetDocumentsWithoutFiltersQuery } from '../../redux/extensionDataManager/extensionDataManagerSlice';
import { TimeLogSummary } from '../../components/timeLogSummary/TimeLogSummary';
import { CircularProgress, Box } from '@mui/material';

export const TimeLogDevOpsSummary: React.FC = () => {
  const [user, setUser] = useState<SDK.IUserContext>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    SDK.init().then(async () => {
      SDK.register(SDK.getContributionId(), () => {});
      await SDK.ready();
      const user = SDK.getUser();
      setUser(user);
      setLoading(false);
    });
  }, []);

  const useFetchDocuments = useFetchGetDocumentsWithoutFiltersQuery(process.env.ENTRIES_COLLECTION_NAME as string);

  return !loading ? (
    <TimeLogSummary
      documents={useFetchDocuments.data && useFetchDocuments.data.items.length > 0 ? useFetchDocuments.data.items : []}
      loadingDocuments={useFetchDocuments.isFetching}
      user={user}
    />
  ) : (
    <Box textAlign="center">
      <CircularProgress className="circular-progress-main-color" />
    </Box>
  );
};
showRootComponent(<TimeLogDevOpsSummary />);
