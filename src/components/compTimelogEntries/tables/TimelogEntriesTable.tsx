import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { MainWrapperComponent, TableComponent } from 'techsbcn-storybook';
import { _VALUES } from '../../../resources/_constants/values';
import { SearchFilters } from '../../../interfaces';
import {
  useFetchGetDocumentsQuery,
  useFetchRemoveDocumentMutation,
} from '../../../redux/extensionDataManager/extensionDataManagerSlice';
import { WorkItemFormService } from '../../../Services/WorkItemService';
import { getHoursAndMinutes, getHoursFromMinutes } from '../../../helpers/TimeHelper';
import { TimeLogEntry } from '../../../Interfaces/TimeLogEntry';

interface TimelogEntriesTableProps {
  witId: number;
}

const TimelogEntriesTable: React.FC<TimelogEntriesTableProps> = (props) => {
  const [filters] = useState<SearchFilters>(JSON.parse(JSON.stringify({})));

  const useFetchDocuments = useFetchGetDocumentsQuery('TimeLogData');
  const [remove, { isLoading: isCreating }] = useFetchRemoveDocumentMutation();

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
        rows={
          useFetchDocuments.data && useFetchDocuments.data.filter((entry) => entry.workItemId == props.witId).length > 0
            ? useFetchDocuments.data.filter((entry) => entry.workItemId == props.witId)
            : []
        }
        columns={[
          { id: 'date', label: _VALUES.DATE, minWidth: 100 },
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
        totalCount={useFetchDocuments.data ? useFetchDocuments.data.length : 0}
        loading={useFetchDocuments.isFetching}
        baseFilters={filters}
      />
    </MainWrapperComponent>
  );
};

export default TimelogEntriesTable;
