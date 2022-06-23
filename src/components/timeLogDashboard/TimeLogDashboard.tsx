import React, { useEffect, useState } from 'react';
import { UserContext, TimeLogEntry, TimeLogEntryFilters } from '../../interfaces';
import { Grid, CircularProgress, Box } from '@mui/material';
import { _VALUES } from '../../resources/_constants/values';
import * as _ from 'lodash';
import DashboardStats from './DashboardStats';
import { SearchComponent, TextFieldComponent } from 'techsbcn-storybook';

interface TimeLogDashboardProps {
  user?: UserContext;
  projectId?: string;
  documents: TimeLogEntry[];
  loadingDocuments: boolean;
}

const TimeLogDashboard: React.FC<TimeLogDashboardProps> = (props) => {
  const [timeLogEntries, setTimeLogEntries] = useState<TimeLogEntry[]>();

  const [filters, setFilters] = useState<TimeLogEntryFilters>(() => {
    const curr = new Date();
    return {
      timeFrom: new Date(
        new Date(curr.setDate(curr.getDate() - curr.getDay() + 1)).setHours(0, 0, 0)
      ).toLocaleDateString('sv-SE'),
      timeTo: new Date(
        new Date(curr.setDate(curr.getDate() - curr.getDay() + 7)).setHours(23, 59, 59)
      ).toLocaleDateString('sv-SE'),
    };
  });
  const [loadingFilters, setLoadingFilters] = useState<boolean>(true);

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

  const loadDocuments = React.useCallback(() => {
    if (filters && props.documents.length > 0) {
      setLoadingFilters(true);
      let documents = JSON.parse(JSON.stringify(props.documents));
      documents = filterByDates(documents);
      setTimeLogEntries(_.orderBy(documents, 'date', 'asc'));
      setLoadingFilters(false);
    }
  }, [filterByDates, filters, props.documents]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const setNewFilters = (value: any, name: string) => {
    const newFilters: any = { ...filters };
    newFilters[name] = value;
    setFilters(newFilters);
  };

  return !props.loadingDocuments ? (
    <Grid container>
      <Grid item xs={12}>
        <SearchComponent
          filters={[
            {
              doubleFilter: {
                firstFilter: (
                  <TextFieldComponent
                    label={_VALUES.FROM}
                    name="timeFrom"
                    defaultValue={filters.timeFrom && new Date(filters.timeFrom).toLocaleDateString('sv-SE')}
                    type="date"
                    onChange={_.debounce(async (e) => setNewFilters(e.target.value, e.target.name), 1000)}
                  />
                ),
                secondFilter: (
                  <TextFieldComponent
                    label={_VALUES.TO}
                    name="timeTo"
                    type="date"
                    defaultValue={filters.timeTo && new Date(filters.timeTo).toLocaleDateString('sv-SE')}
                    onChange={_.debounce(async (e) => {
                      const date = new Date(new Date(e.target.value).setHours(23, 59, 59));
                      setNewFilters(
                        !isNaN(date.valueOf()) ? date.toLocaleDateString('sv-SE') : e.target.value,
                        e.target.name
                      );
                    }, 1000)}
                  />
                ),
              },
            },
          ]}
        />
      </Grid>
      <Grid item xs={12}>
        <DashboardStats
          loading={loadingFilters}
          workItemIds={
            timeLogEntries && timeLogEntries.length > 0
              ? Array.from(new Set(timeLogEntries.map((x) => Number(x.workItemId))))
              : []
          }
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

export default TimeLogDashboard;
