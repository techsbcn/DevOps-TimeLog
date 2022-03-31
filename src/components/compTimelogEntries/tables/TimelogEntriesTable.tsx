import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { MainWrapperComponent, TableComponent } from 'techsbcn-storybook';
import { _VALUES } from '../../../resources/_constants/values';
import { SearchBaseDefaults, TimeLogEntry } from '../../../interfaces';
import {
  useFetchGetDocumentsQuery,
  useFetchRemoveDocumentMutation,
} from '../../../redux/extensionDataManager/extensionDataManagerSlice';
import { WorkItemFormService } from '../../../Services/WorkItemService';
import { getHoursAndMinutes, getHoursFromMinutes } from '../../../helpers/TimeHelper';

interface TimelogEntriesTableProps {
  workItemId: number;
}

const TimelogEntriesTable: React.FC<TimelogEntriesTableProps> = (props) => {
  const [filters, setFilters] = useState(SearchBaseDefaults);

  const useFetchDocuments = useFetchGetDocumentsQuery({
    collectionName: 'TimeLogData',
    filters: { ...filters, filter: { workItemId: props.workItemId } },
  });
  const [remove] = useFetchRemoveDocumentMutation();

  const updateWitForm = async (entry: TimeLogEntry): Promise<boolean> => {
    const workItemFormService = await WorkItemFormService;
    const remainingWork = Number(
      await workItemFormService.getFieldValue('Remaining Work', { returnOriginalValue: false })
    );
    const completedWork = Number(
      await workItemFormService.getFieldValue('Completed Work', { returnOriginalValue: false })
    );
    const hours = getHoursFromMinutes(entry.time);
    return (
      (await workItemFormService.setFieldValue('Remaining Work', remainingWork + hours)) &&
      (await workItemFormService.setFieldValue('Completed Work', completedWork - hours))
    );
  };

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
          { id: 'user', label: _VALUES.USER, minWidth: 100 },
          { id: 'activity', label: _VALUES.ACTIVITY, minWidth: 100 },
          { id: 'notes', label: _VALUES.NOTES, minWidth: 100 },

          {
            id: 'actions',
            label: _VALUES.ACTIONS,
            action: [
              {
                children: <FontAwesomeIcon icon={faTrashAlt} />,
                onClick: async (row: any) => {
                  const workItemFormService = await WorkItemFormService;
                  updateWitForm(row);
                  remove({ collectionName: 'TimeLogData', id: row.id })
                    .then(() => {
                      workItemFormService.save();
                    })
                    .catch(() => {
                      workItemFormService.reset();
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
