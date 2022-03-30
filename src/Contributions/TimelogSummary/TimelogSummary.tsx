import React, { useEffect } from 'react';
import * as SDK from 'azure-devops-extension-sdk';
import { showRootComponent } from '../..';
import { _VALUES } from '../../resources';
import {
  useFetchGetDocumentsQuery,
  useFetchCreateDocumentMutation,
} from '../../redux/extensionDataManager/extensionDataManagerSlice';
import { ButtonComponent } from 'techsbcn-storybook';
import { Box } from '@mui/material';

export const TimelogSummary: React.FC = () => {
  useEffect(() => {
    SDK.init().then(async () => {
      SDK.register(SDK.getContributionId(), () => {});
    });
  }, []);

  const useFetchDocuments = useFetchGetDocumentsQuery('TimeLogData');
  console.log('Redux', useFetchDocuments);

  const useFetchTest = useFetchGetDocumentsQuery('Test');
  const [create, { isLoading: isCreating }] = useFetchCreateDocumentMutation();
  console.log('Redux documents', useFetchTest);
  return (
    <Box>
      <ButtonComponent
        label={_VALUES.SAVE}
        onClick={() =>
          create({ collectionName: 'Test', doc: { name: `test-${Math.random().toString(36).substring(7)}` } })
        }
        loading={isCreating}
      />
      {useFetchTest.data &&
        useFetchTest.data.length > 0 &&
        useFetchTest.data.map((item) => (
          <Box m={2} key={item.id}>
            {item.name}
          </Box>
        ))}
    </Box>
  );
};
showRootComponent(<TimelogSummary />);
