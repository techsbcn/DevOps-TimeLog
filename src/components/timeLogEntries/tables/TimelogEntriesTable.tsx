import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
import { MainWrapperComponent, ModalComponent, TableComponent } from 'techsbcn-storybook';
import { _VALUES } from '../../../resources/_constants/values';
import { SearchBaseDefaults, TimeLogEntry } from '../../../interfaces';
import {
  useFetchGetDocumentsQuery,
  useFetchRemoveDocumentMutation,
  useFetchUpdateDocumentMutation,
} from '../../../redux/extensionDataManager/extensionDataManagerSlice';
import { getHoursAndMinutes, getHoursFromMinutes, getMinutesFromHours } from '../../../helpers/TimeHelper';
import { PatchWorkItem, WorkItemFormService } from '../../../redux/workItem/workItemAPI';
import dayjs from 'dayjs';
import TimelogEntriesForm from '../forms/TimelogEntriesForm';
import { IUserContext } from 'azure-devops-extension-sdk';

interface TimelogEntriesTableProps {
  workItemId: number;
  workItemName: string;
  user: IUserContext;
}

const TimelogEntriesTable: React.FC<TimelogEntriesTableProps> = (props) => {
  const [filters, setFilters] = useState(SearchBaseDefaults);

  const useFetchDocuments = useFetchGetDocumentsQuery({
    collectionName: process.env.ENTRIES_COLLECTION_NAME as string,
    filters: { ...filters, filter: { workItemId: props.workItemId } },
  });

  const [remove] = useFetchRemoveDocumentMutation();
  const [update] = useFetchUpdateDocumentMutation();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [timeLogEntry, setTimeLogEntry] = useState<any>();

  const onSubmit = async (data: any) => {
    const workItemFormService = await WorkItemFormService;
    const timeEntry: TimeLogEntry = {
      user: props.user.displayName,
      userId: props.user.id,
      workItemId: props.workItemId ?? 0,
      workItemName: props.workItemName ?? '',
      startTime: data.startTime,
      date: data.date,
      time: Number(getMinutesFromHours(data.timeHours)) + Number(data.timeMinutes),
      notes: data.notes,
      type: data.type ? data.type.name : undefined,
    };
    const hours = getHoursFromMinutes(timeEntry.time);
    PatchWorkItem(
      ['Microsoft.VSTS.Scheduling.CompletedWork', 'Microsoft.VSTS.Scheduling.RemainingWork'],
      (item: any) => {
        item['Microsoft.VSTS.Scheduling.CompletedWork'] += hours;
        item['Microsoft.VSTS.Scheduling.RemainingWork'] -= hours;
        if (item['Microsoft.VSTS.Scheduling.RemainingWork'] < 0) item['Microsoft.VSTS.Scheduling.RemainingWork'] = 0;
        return item;
      }
    ).then(() => {
      update({ collectionName: process.env.ENTRIES_COLLECTION_NAME as string, doc: timeEntry })
        .then(async () => {
          await workItemFormService.save();
        })
        .catch(async () => {
          await workItemFormService.reset();
        });
    });
  };

  return (
    <>
      <MainWrapperComponent
        headerProps={{
          title: _VALUES.TIMELOG_ENTRIES,
        }}
      >
        <TableComponent
          rows={useFetchDocuments.data && useFetchDocuments.data.items.length > 0 ? useFetchDocuments.data.items : []}
          columns={[
            {
              id: 'date',
              label: _VALUES.DATE,
              minWidth: 100,
              rowViewFormat: (row) => {
                if (row.startTime) {
                  return dayjs.utc(row.date).format('L HH:mm');
                } else {
                  return dayjs.utc(row.date).format('L');
                }
              },
            },
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
                  children: <FontAwesomeIcon icon={faEdit} />,
                  onClick: async (row: any) => {
                    setShowModal(true);
                    setTimeLogEntry(row);
                  },
                },
                {
                  children: <FontAwesomeIcon icon={faTrashAlt} />,
                  onClick: async (row: any) => {
                    const workItemFormService = await WorkItemFormService;
                    const hours = getHoursFromMinutes(row.time);
                    PatchWorkItem(
                      ['Microsoft.VSTS.Scheduling.CompletedWork', 'Microsoft.VSTS.Scheduling.RemainingWork'],
                      (item: any) => {
                        item['Microsoft.VSTS.Scheduling.CompletedWork'] -= hours;
                        item['Microsoft.VSTS.Scheduling.RemainingWork'] += hours;
                        return item;
                      }
                    ).then(() => {
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
      {showModal && (
        <ModalComponent
          title={'Edit Time log entry'}
          setShow={showModal}
          onHide={() => setShowModal(false)}
          cancelButton={{ label: _VALUES.CANCEL }}
          submitButton={{
            label: _VALUES.SAVE,
            form: 'timelog-form',
            type: 'submit',
          }}
          loading={false}
        >
          <TimelogEntriesForm action={onSubmit} loading={false} data={timeLogEntry} />
        </ModalComponent>
      )}
    </>
  );
};

export default TimelogEntriesTable;
