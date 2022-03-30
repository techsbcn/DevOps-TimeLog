import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { ButtonComponent, MainWrapperComponent, TableComponent } from 'techsbcn-storybook';
import { _VALUES } from '../../../resources/_constants/values';
import { SearchFilters } from '../../../interfaces';
import { TimeLogEntry } from '../../../Interfaces/TimeLogEntry';
import { getEntriesByWorkItemId } from '../../../Services/TimelogEntriesAPI';

interface TimelogEntriesTableProps {
  witId: number;
}

const TimelogEntriesTable: React.FC<TimelogEntriesTableProps> = (props) => {
  const [filters, setFilters] = useState<SearchFilters>(JSON.parse(JSON.stringify({})));
  const [witEntries, setWitEntries] = useState<TimeLogEntry[]>([]);

  const getHoursAndMinutes = (allMinutes: number) => {
    const hours = allMinutes / 60;
    const rhours = Math.floor(hours);
    const minutes = (hours - rhours) * 60;
    return `${rhours}:${minutes}`;
  };

  useEffect(() => {
    getEntriesByWorkItemId(props.witId).then((entries) => {
      setWitEntries(entries);
    });
  }, [props.witId]);

  return (
    <>
      <MainWrapperComponent
        headerProps={{
          enableAfter: true,
          title: _VALUES.TIMELOG_ENTRIES,
        }}
      >
        <TableComponent
          rows={witEntries && witEntries.length > 0 ? witEntries : []}
          columns={[
            { id: 'date', label: _VALUES.DATE, minWidth: 100 },
            {
              id: 'time',
              label: _VALUES.TIME,
              minWidth: 100,
              rowViewFormat: (row) => {
                return getHoursAndMinutes(row.time);
              },
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
          totalCount={witEntries ? witEntries.length : 0}
          baseFilters={filters}
        />
      </MainWrapperComponent>
    </>
  );
};

export default TimelogEntriesTable;
