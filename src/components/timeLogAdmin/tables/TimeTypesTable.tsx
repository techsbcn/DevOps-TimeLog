import React, { useState } from 'react';
import { MainWrapperComponent, TableComponent } from 'techsbcn-storybook';
import { _VALUES } from '../../../resources/_constants/values';
import { SearchBaseDefaults } from '../../../interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import {
  useFetchGetDocumentsQuery,
  useFetchRemoveDocumentMutation,
} from '../../../redux/extensionDataManager/extensionDataManagerSlice';

const TimeTypesTable: React.FC = () => {
  const [filters, setFilters] = useState(SearchBaseDefaults);
  const useFetchDocuments = useFetchGetDocumentsQuery({
    collectionName: process.env.ACTIVITIES_COLLECTION_NAME as string,
    filters: filters,
  });
  const [remove] = useFetchRemoveDocumentMutation();
  return (
    <MainWrapperComponent
      headerProps={{
        title: _VALUES.ACTIVITIES,
      }}
    >
      <TableComponent
        rows={useFetchDocuments.data && useFetchDocuments.data.items.length > 0 ? useFetchDocuments.data.items : []}
        columns={[
          {
            id: 'date',
            label: _VALUES.CREATED_ON,
            minWidth: 100,
            rowViewFormat: (row) => new Date(row.date).toLocaleString(),
          },
          {
            id: 'user',
            label: _VALUES.CREATED_BY,
            minWidth: 100,
          },
          { id: 'name', label: _VALUES.NAME, minWidth: 100 },
          {
            id: 'actions',
            label: _VALUES.ACTIONS,
            minWidth: 10,
            action: [
              {
                children: <FontAwesomeIcon icon={faTrashAlt} />,
                onClick: async (row: any) => {
                  remove({ collectionName: process.env.ACTIVITIES_COLLECTION_NAME as string, id: row.id });
                },
              },
            ],
          },
        ]}
        values={_VALUES}
        totalCount={useFetchDocuments.data ? useFetchDocuments.data.totalCount : 0}
        loading={useFetchDocuments.isFetching}
        onFiltersChange={(filters: any) => setFilters(filters)}
        baseFilters={filters}
      />
    </MainWrapperComponent>
  );
};

export default TimeTypesTable;
