import React, { useEffect, useState } from 'react';
import { Grid, CircularProgress, Box } from '@mui/material';
import { TimeLogEntry, TimeLogEntryFilters, UserContext } from '../../interfaces';
import * as _ from 'lodash';
import TimeLogDetails from '../../components/timeLogSummary/TimeLogDetails';
import TimeLogTable from '../../components/timeLogSummary/TimeLogTable';
import TimeLogFilters from '../../components/timeLogSummary/TimeLogFilters';
import { _VALUES } from '../../resources/_constants/values';

interface TimeLogMainSummaryProps {
  documents: TimeLogEntry[];
  loadingDocuments: boolean;
  user?: UserContext;
  projectId: string;
}

const TimeLogMainSummary: React.FC<TimeLogMainSummaryProps> = (props) => {
  const [filters, setFilters] = useState<TimeLogEntryFilters>(() => {
    const curr = new Date();
    return {
      userIds: props.user && props.user.id ? [props.user.id] : [],
      timeFrom: new Date(
        new Date(curr.setDate(curr.getDate() - curr.getDay() + 1)).setHours(0, 0, 0)
      ).toLocaleDateString('sv-SE'),
      timeTo: new Date(
        new Date(curr.setDate(curr.getDate() - curr.getDay() + 7)).setHours(23, 59, 59)
      ).toLocaleDateString('sv-SE'),
    };
  });
  const [timeLogEntries, setTimeLogEntries] = useState<TimeLogEntry[]>(props.documents);
  const [loadingFilters, setLoadingFilters] = useState<boolean>(false);

  const filterByDates = React.useCallback(
    (array: any[]) => {
      if (filters && filters.timeTo && filters.timeFrom) {
        return array.filter(
          (item: any) =>
            filters.timeTo && filters.timeFrom && item.date >= filters.timeFrom && item.date <= filters.timeTo
        );
      } else {
        return array;
      }
    },
    [filters]
  );

  const filterByUserIds = React.useCallback(
    (array: any[]) => {
      if (filters && filters.userIds && filters.userIds.length > 0) {
        return array.filter((item: any) => filters && filters.userIds && filters.userIds.includes(item.userId));
      } else {
        return array;
      }
    },
    [filters]
  );
  const loadDocuments = React.useCallback(() => {
    if (filters && props.documents.length > 0) {
      setLoadingFilters(true);
      let documents = filters && filters.userIds ? JSON.parse(JSON.stringify(props.documents)) : [];
      documents = filterByDates(documents);
      documents = filterByUserIds(documents);
      setTimeLogEntries(_.orderBy(documents, 'date', 'asc'));
      setLoadingFilters(false);
    }
  }, [filterByDates, filterByUserIds, filters, props.documents]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const setNewFilters = (value: any, name: string) => {
    const newFilters: any = { ...filters };
    newFilters[name] = value;
    setFilters(newFilters);
  };

  return !props.loadingDocuments ? (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TimeLogFilters
          onFiltersChange={setNewFilters}
          filters={filters}
          user={props.user}
          loading={loadingFilters}
          projectId={props.projectId}
        />
      </Grid>
      <Grid item xs={12}>
        <TimeLogDetails
          timeLogEntries={timeLogEntries && timeLogEntries.length > 0 ? timeLogEntries : []}
          loading={props.loadingDocuments || loadingFilters}
        />
      </Grid>
      <Grid item xs={12}>
        <TimeLogTable
          documents={timeLogEntries && timeLogEntries.length > 0 ? timeLogEntries : []}
          loading={props.loadingDocuments || loadingFilters}
        />
      </Grid>
    </Grid>
  ) : (
    <Box textAlign="center" display="flex" alignItems="center" justifyContent="center">
      <CircularProgress className="circular-progress-main-color" />
      <Box ml={2}>{_VALUES.LOADING}...</Box>
    </Box>
  );
};

export default TimeLogMainSummary;
