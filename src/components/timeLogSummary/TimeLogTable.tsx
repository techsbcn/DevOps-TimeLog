import React from 'react';
import { _VALUES } from '../../resources/_constants/values';
import { MainWrapperComponent, SimpleTableComponent } from 'techsbcn-storybook';
import { TimeLogEntry } from '../../interfaces';
import { getHoursAndMinutes } from '../../helpers/TimeHelper';

interface TimeLogTableProps {
  documents: TimeLogEntry[];
  loading: boolean;
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
          { id: 'date', label: _VALUES.DATE, minWidth: 100, isDate: true },
          { id: 'workItemId', label: _VALUES.WORK_ITEM, minWidth: 100 },
          {
            id: 'time',
            label: _VALUES.TIME,
            minWidth: 100,
            rowViewFormat: (row) => getHoursAndMinutes(row.time),
          },
          { id: 'user', label: _VALUES.USER, minWidth: 100 },
          { id: 'type', label: _VALUES.ACTIVITY, minWidth: 100 },
          { id: 'notes', label: _VALUES.NOTES, minWidth: 100 },
        ]}
      />
    </MainWrapperComponent>
  );
};

export default TimeLogTable;
