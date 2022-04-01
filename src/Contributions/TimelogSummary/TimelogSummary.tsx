import React, { useEffect } from 'react';
import * as SDK from 'azure-devops-extension-sdk';
import { showRootComponent } from '../..';
import { _VALUES } from '../../resources/_constants/values';
import { useFetchGetDocumentsQuery } from '../../redux/extensionDataManager/extensionDataManagerSlice';
import { Box } from '@mui/material';
import { SearchBaseDefaults } from '../../interfaces';
import { MainWrapperComponent, SimpleTableComponent } from 'techsbcn-storybook';

export const TimelogSummary: React.FC = () => {
  useEffect(() => {
    SDK.init().then(async () => {
      SDK.register(SDK.getContributionId(), () => {});
    });
  }, []);

  const useFetchDocuments = useFetchGetDocumentsQuery({ collectionName: 'TimeLogData', filters: SearchBaseDefaults });

  return (
    <MainWrapperComponent
      headerProps={{
        title: _VALUES.TIMELOG_ENTRIES,
      }}
    >
      <SimpleTableComponent
        rows={useFetchDocuments.data && useFetchDocuments.data.items.length > 0 ? useFetchDocuments.data.items : []}
        values={_VALUES}
        loading={useFetchDocuments.isFetching}
        columns={[{ id: 'date', label: _VALUES.DATE, minWidth: 100, isDate: true }]}
      />
    </MainWrapperComponent>
  );
};
showRootComponent(<TimelogSummary />);
