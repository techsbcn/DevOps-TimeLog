import React, { useEffect } from 'react';
import * as SDK from 'azure-devops-extension-sdk';
import { showRootComponent } from '../..';
import { _VALUES } from '../../resources/_constants/values';
import { useFetchGetDocumentsQuery } from '../../redux/extensionDataManager/extensionDataManagerSlice';
import { Container, Grid } from '@mui/material';
import { SearchBaseDefaults } from '../../interfaces';
import { MainWrapperComponent, SimpleTableComponent } from 'techsbcn-storybook';
import { getHoursAndMinutes } from '../../helpers';

export const TimelogSummary: React.FC = () => {
  useEffect(() => {
    SDK.init().then(async () => {
      SDK.register(SDK.getContributionId(), () => {});
    });
  }, []);

  const useFetchDocuments = useFetchGetDocumentsQuery({ collectionName: 'TimeLogData', filters: SearchBaseDefaults });

  return (
    <Container maxWidth={false}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <MainWrapperComponent
            headerProps={{
              title: _VALUES.TIMELOG_ENTRIES,
            }}
          >
            <SimpleTableComponent
              rows={
                useFetchDocuments.data && useFetchDocuments.data.items.length > 0 ? useFetchDocuments.data.items : []
              }
              values={_VALUES}
              loading={useFetchDocuments.isFetching}
              columns={[
                { id: 'date', label: _VALUES.DATE, minWidth: 100, isDate: true },
                {
                  id: 'time',
                  label: _VALUES.TIME,
                  minWidth: 100,
                  rowViewFormat: (row) => getHoursAndMinutes(row.time),
                },
                { id: 'user', label: _VALUES.USER, minWidth: 100 },
                { id: 'activity.name', label: _VALUES.ACTIVITY, minWidth: 100 },
                { id: 'notes', label: _VALUES.NOTES, minWidth: 100 },
              ]}
            />
          </MainWrapperComponent>
        </Grid>
      </Grid>
    </Container>
  );
};
showRootComponent(<TimelogSummary />);
