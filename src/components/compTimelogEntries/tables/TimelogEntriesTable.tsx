import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { MainWrapperComponent, TableComponent } from 'techsbcn-storybook';
import { _VALUES } from '../../../resources/_constants/values';
import { SearchFilters } from '../../../interfaces';
import { useFetchGetDocumentsQuery } from '../../../redux/extensionDataManager/extensionDataManagerSlice';

interface TimelogEntriesTableProps {
  witId: number;
}

const TimelogEntriesTable: React.FC<TimelogEntriesTableProps> = () => {
  const [filters] = useState<SearchFilters>(JSON.parse(JSON.stringify({})));

  const getHoursAndMinutes = (allMinutes: number) => {
    const hours = allMinutes / 60;
    const rhours = Math.floor(hours);
    const minutes = (hours - rhours) * 60;
    return `${rhours}:${minutes}`;
  };

  const useFetchDocuments = useFetchGetDocumentsQuery('TimeLogData');

  return (
    <MainWrapperComponent
      headerProps={{
        title: _VALUES.TIMELOG_ENTRIES,
      }}
    >
      <TableComponent
        rows={useFetchDocuments.data && useFetchDocuments.data.length > 0 ? useFetchDocuments.data : []}
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
                onClickId: (id: number) => {},
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
