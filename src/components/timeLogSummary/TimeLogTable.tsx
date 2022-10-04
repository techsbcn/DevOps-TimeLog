import React from 'react';
import { _VALUES } from '../../resources/_constants/values';
import { MainWrapperComponent, SimpleTableComponent } from 'techsbcn-storybook';
import { TimeLogEntry } from '../../interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { getHoursAndMinutes } from '../../helpers/TimeHelper';

interface TimeLogTableProps {
  documents: TimeLogEntry[];
  loading: boolean;
  urlWorkItem?: string;
}

const TimeLogTable: React.FC<TimeLogTableProps> = (props) => {
  return (
    <MainWrapperComponent
      headerProps={{
        title: _VALUES.TIMELOG_ENTRIES,
      }}
    >
      <SimpleTableComponent
        rows={props.documents}
        values={_VALUES}
        loading={props.loading}
        columns={[
          { id: 'date', label: _VALUES.DATE, minWidth: 60, isDate: true },
          {
            id: 'workItemId',
            label: _VALUES.WORK_ITEM,
            maxWidth: 50,
            rowViewFormat: (row) =>
              props.urlWorkItem ? (
                <a className="afn" target="_blank" href={`${props.urlWorkItem}/${row.workItemId}`} rel="noreferrer">
                  {`${row.workItemId}${row.workItemName ? ` - ${row.workItemName}` : ''} `}
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                </a>
              ) : (
                `${row.workItemId}${row.workItemName ? ` - ${row.workItemName}` : ''}`
              ),
          },
          {
            id: 'time',
            label: _VALUES.TIME,
            minWidth: 30,
            rowViewFormat: (row) => getHoursAndMinutes(row.time),
          },
          { id: 'user', label: _VALUES.USER, minWidth: 150 },
          { id: 'type', label: _VALUES.ACTIVITY, minWidth: 150 },
          { id: 'notes', label: _VALUES.NOTES, minWidth: 150 },
        ]}
      />
    </MainWrapperComponent>
  );
};

export default TimeLogTable;
