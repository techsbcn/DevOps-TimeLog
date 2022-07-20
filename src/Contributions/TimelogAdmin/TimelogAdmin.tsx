import React, { useEffect, useState } from 'react';
import * as SDK from 'azure-devops-extension-sdk';
import { showRootComponent } from '../..';
import { Grid, Container, Box } from '@mui/material';
import TimeTypeForm from '../../components/timeLogAdmin/forms/TimeTypeForm';
import TimeTypesTable from '../../components/timeLogAdmin/tables/TimeTypesTable';
import { useFetchCreateDocumentMutation } from '../../redux/extensionDataManager/extensionDataManagerSlice';
import { TimeType } from '../../interfaces';
import About from '../../components/timeLogAdmin/forms/About';
import { _VALUES } from '../../resources/_constants/values';

export const TimelogAdmin: React.FC = () => {
  const [timeLogType, setTimeLogType] = useState<TimeType>();
  const [activeTab, setActiveTab] = useState(0);
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    SDK.init().then(async () => {
      SDK.register(SDK.getContributionId(), () => {});
      await SDK.ready();
      const user = SDK.getUser();
      setVersion(SDK.getExtensionContext().version);
      user && setTimeLogType({ user: user.displayName, userId: user.id });
    });
  }, []);

  const [create, { isLoading: isCreating }] = useFetchCreateDocumentMutation();

  const onSubmit = async (data: any) => {
    const doc = Object.assign(timeLogType, data);
    create({
      collectionName: process.env.ACTIVITIES_COLLECTION_NAME as string,
      doc: { ...doc, date: new Date().toLocaleString('sv-SE') },
    });
  };
  const tabs = [
    <Grid key={0} container spacing={2}>
      <Grid item xs={12}>
        <TimeTypeForm action={onSubmit} loading={isCreating} />
      </Grid>
      <Grid item xs={12}>
        <TimeTypesTable />
      </Grid>
      <Grid item xs={12}></Grid>
    </Grid>,
    <About key={1} version={version} />,
  ];

  const renderTabContent = (tab: number) => {
    return tabs[tab];
  };

  return (
    <>
      <Grid container>
        <Grid item xs={3}>
          <Box
            fontWeight={'bold'}
            fontSize={'1rem'}
            className={` main-color hover-underline ${activeTab === 0 && 'text-main-underline'}`}
            onClick={() => setActiveTab(0)}
            width="fit-content"
          >
            {_VALUES.ACTIVITY_MANAGEMENT}
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box
            fontWeight={'bold'}
            fontSize={'1rem'}
            className={`main-color hover-underline ${activeTab === 1 && 'text-main-underline'}`}
            onClick={() => setActiveTab(1)}
            width="fit-content"
          >
            {_VALUES.ABOUT}
          </Box>
        </Grid>
      </Grid>
      <Box mt={2}>{renderTabContent(activeTab)}</Box>
    </>
  );
};

showRootComponent(<TimelogAdmin />);
