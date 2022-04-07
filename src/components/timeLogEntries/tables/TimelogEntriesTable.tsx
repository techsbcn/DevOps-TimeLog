import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { MainWrapperComponent, TableComponent } from 'techsbcn-storybook';
import { _VALUES } from '../../../resources/_constants/values';
import { SearchBaseDefaults } from '../../../interfaces';
import {
  useFetchGetDocumentsQuery,
  useFetchRemoveDocumentMutation,
} from '../../../redux/extensionDataManager/extensionDataManagerSlice';
import { getHoursAndMinutes, getHoursFromMinutes } from '../../../helpers/TimeHelper';
import { PatchWorkItem, WorkItemFormService } from '../../../redux/workItem/workItemAPI';

interface TimelogEntriesTableProps {
  workItemId: number;
}

const TimelogEntriesTable: React.FC<TimelogEntriesTableProps> = (props) => {
  const [filters, setFilters] = useState(SearchBaseDefaults);

  const useFetchDocuments = useFetchGetDocumentsQuery({
    collectionName: process.env.ENTRIES_COLLECTION_NAME as string,
    filters: { ...filters, filter: { workItemId: props.workItemId } },
  });

  const [remove] = useFetchRemoveDocumentMutation();

  return (
    <MainWrapperComponent
      headerProps={{
        title: _VALUES.TIMELOG_ENTRIES,
      }}
    >
      <TableComponent
        rows={useFetchDocuments.data && useFetchDocuments.data.items.length > 0 ? useFetchDocuments.data.items : []}
        columns={[
          { id: 'date', label: _VALUES.DATE, minWidth: 100, isDate: true },
          {
            id: 'time',
            label: _VALUES.TIME,
            minWidth: 100,
            rowViewFormat: (row) => getHoursAndMinutes(row.time),
          },
          { id: 'user', label: _VALUES.USER, minWidth: 100, noSort: true },
          { id: 'type', label: _VALUES.ACTIVITY, minWidth: 100 },
          { id: 'notes', label: _VALUES.NOTES, minWidth: 100 },
          {
            id: 'actions',
            label: _VALUES.ACTIONS,
            action: [
              {
                children: <FontAwesomeIcon icon={faTrashAlt} />,
                onClick: async (row: any) => {
                  const workItemFormService = await WorkItemFormService;
                  const hours = getHoursFromMinutes(row.time);
                  PatchWorkItem(['Completed Work', 'Remaining Work'], (item: any) => {
                    item['Completed Work'] -= hours;
                    item['Remaining Work'] += hours;
                    return item;
                  }).then(() => {
                    remove({ collectionName: process.env.ENTRIES_COLLECTION_NAME as string, id: row.id })
                      .then(() => {
                        workItemFormService.save();
                      })
                      .catch(() => {
                        workItemFormService.reset();
                      });
                  });
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

export default TimelogEntriesTable;
