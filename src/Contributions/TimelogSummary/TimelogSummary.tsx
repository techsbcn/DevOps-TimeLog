import React, { useEffect } from 'react';
import * as SDK from 'azure-devops-extension-sdk';
import { showRootComponent } from '../..';
import { _VALUES } from '../../resources';
import { useFetchGetDocumentsQuery } from '../../redux/extensionDataManager/extensionDataManagerSlice';
import { Box } from '@mui/material';
import { SearchBaseDefaults } from '../../interfaces';

export const TimelogSummary: React.FC = () => {
  useEffect(() => {
    SDK.init().then(async () => {
      SDK.register(SDK.getContributionId(), () => {});
    });
  }, []);

  const useFetchDocuments = useFetchGetDocumentsQuery({ collectionName: 'TimeLogData', filters: SearchBaseDefaults });
  console.log('Redux', useFetchDocuments);

  return (
    <Box>
      {useFetchDocuments.data &&
        useFetchDocuments.data.items.length > 0 &&
        useFetchDocuments.data.items.map((item) => (
          <Box m={2} key={item.id}>
            {item.user}
          </Box>
        ))}
    </Box>
  );
};
showRootComponent(<TimelogSummary />);
