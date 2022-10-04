import React, { useEffect, useState } from 'react';
import * as SDK from 'azure-devops-extension-sdk';
import { showRootComponent } from '../..';
import { useFetchGetDocumentsWithoutFiltersQuery } from '../../redux/extensionDataManager/extensionDataManagerSlice';
import TimeLogMainSummary from '../../components/timeLogSummary/TimeLogMainSummary';
import { CircularProgress, Box, Grid } from '@mui/material';
import { _VALUES } from '../../resources/_constants/values';
import { GetProjectContext } from '../../redux/core/coreAPI';
import { useAppDispatch } from '../../helpers/hooks';
import { addAllCoreState } from '../../redux/core/coreSlice';
import { ContextType } from '../../enums/ContextType';
import TimeLogDashboard from '../../components/timeLogDashboard/TimeLogDashboard';

export const TimeLogDevOpsSummary: React.FC = () => {
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<SDK.IUserContext>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    SDK.init().then(async () => {
      SDK.register(SDK.getContributionId(), () => {});
      await SDK.ready();
      const user = SDK.getUser();
      const project = await GetProjectContext();
      const host = SDK.getHost();
      const token = await SDK.getAccessToken();
      dispatch(
        addAllCoreState({
          contextType: ContextType.DEVOPS,
          token: token,
          organization: { label: host.name, value: host.id },
          project: { label: project.name, value: project.id },
        })
      );
      setUser(user);
      setLoading(false);
    });
  }, [dispatch]);

  const useFetchDocuments = useFetchGetDocumentsWithoutFiltersQuery({
    collectionName: process.env.ENTRIES_COLLECTION_NAME as string,
  });

  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    <TimeLogDashboard
      key={0}
      documents={useFetchDocuments.data && useFetchDocuments.data.items.length > 0 ? useFetchDocuments.data.items : []}
      loadingDocuments={useFetchDocuments.isFetching}
    />,
    <TimeLogMainSummary
      key={1}
      documents={useFetchDocuments.data && useFetchDocuments.data.items.length > 0 ? useFetchDocuments.data.items : []}
      loadingDocuments={useFetchDocuments.isFetching}
      user={user}
    />,
  ];

  const renderTabContent = (tab: number) => {
    return tabs[tab];
  };

  return !loading ? (
    <>
      <Grid container>
        <Grid item xs={3}>
          <Box
            fontWeight={'bold'}
            fontSize={'1rem'}
            className={`main-color hover-underline ${activeTab === 0 && 'text-main-underline'}`}
            onClick={() => setActiveTab(0)}
            width="fit-content"
          >
            {_VALUES.DASHBOARD}
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box
            fontWeight={'bold'}
            fontSize={'1rem'}
            className={` main-color hover-underline ${activeTab === 1 && 'text-main-underline'}`}
            onClick={() => setActiveTab(1)}
            width="fit-content"
          >
            {_VALUES.LOG_ENTRIES}
          </Box>
        </Grid>
      </Grid>
      <Box mt={activeTab === 1 ? 2 : 4}>{renderTabContent(activeTab)}</Box>
    </>
  ) : (
    <Box textAlign="center" display="flex" alignItems="center" justifyContent="center">
      <CircularProgress className="circular-progress-main-color" />
      <Box ml={2}>{_VALUES.LOADING}...</Box>
    </Box>
  );
};
showRootComponent(<TimeLogDevOpsSummary />);
