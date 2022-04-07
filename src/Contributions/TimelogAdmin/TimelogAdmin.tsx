import React, { useEffect, useState } from 'react';
import * as SDK from 'azure-devops-extension-sdk';
import { showRootComponent } from '../..';
import { Grid, Container } from '@mui/material';
import TimeTypeForm from '../../components/timeLogAdmin/forms/TimeTypeForm';
import TimeTypesTable from '../../components/timeLogAdmin/tables/TimeTypesTable';
import { useFetchCreateDocumentMutation } from '../../redux/extensionDataManager/extensionDataManagerSlice';
import { TimeType } from '../../interfaces';

export const TimelogAdmin: React.FC = () => {
  const [timeLogType, setTimeLogType] = useState<TimeType>();

  useEffect(() => {
    SDK.init().then(async () => {
      SDK.register(SDK.getContributionId(), () => {});
      await SDK.ready();
      const user = SDK.getUser();
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

  return (
    <Container maxWidth={false}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TimeTypeForm action={onSubmit} loading={isCreating} />
        </Grid>
        <Grid item xs={12}>
          <TimeTypesTable />
        </Grid>
        <Grid item xs={12}></Grid>
      </Grid>
    </Container>
  );
};

showRootComponent(<TimelogAdmin />);
