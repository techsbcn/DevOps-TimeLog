import React, { useEffect, useState } from 'react';
import * as SDK from 'azure-devops-extension-sdk';
import { showRootComponent } from '../..';
import { _VALUES } from '../../resources/_constants/values';
import { useFetchGetDocumentsWithoutFiltersQuery } from '../../redux/extensionDataManager/extensionDataManagerSlice';
import { Container, Grid } from '@mui/material';
import { TimeLogEntry, TimeLogEntryFilters } from '../../interfaces';
import { MainWrapperComponent, SimpleTableComponent } from 'techsbcn-storybook';
import { getHoursAndMinutes } from '../../helpers';
import TimeLogFilters from '../../components/timeLogSummary/TimeLogFilters';
import * as _ from 'lodash';
import TimeLogDetails from '../../components/timeLogSummary/TimeLogDetails';

export const TimelogSummary: React.FC = () => {
  const [user, setUser] = useState<SDK.IUserContext>();
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<TimeLogEntryFilters>();
  const [loadingFilters, setLoadingFilters] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    SDK.init().then(async () => {
      SDK.register(SDK.getContributionId(), () => {});
      await SDK.ready();
      const user = SDK.getUser();
      setUser(user);
      const curr = new Date();
      user &&
        setFilters({
          userIds: [user.id],
          timeFrom: new Date(
            new Date(curr.setDate(curr.getDate() - curr.getDay() + 1)).setHours(0, 0, 0)
          ).toLocaleDateString('sv-SE'),
          timeTo: new Date(
            new Date(curr.setDate(curr.getDate() - curr.getDay() + 7)).setHours(23, 59, 59)
          ).toLocaleDateString('sv-SE'),
        });
      setLoading(false);
    });
  }, []);

  const useFetchDocuments = useFetchGetDocumentsWithoutFiltersQuery(process.env.ENTRIES_COLLECTION_NAME as string);

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
  const [timeLogEntries, setTimeLogEntries] = useState<TimeLogEntry[]>([]);

  const loadDocuments = React.useCallback(() => {
    if (filters && useFetchDocuments.data && useFetchDocuments.data.items.length > 0) {
      setLoadingFilters(true);
      let documents = filters && filters.userIds ? JSON.parse(JSON.stringify(useFetchDocuments.data.items)) : [];
      documents = filterByDates(documents);
      documents = filterByUserIds(documents);
      setTimeLogEntries(_.orderBy(documents, 'date', 'asc'));
      setLoadingFilters(false);
    }
  }, [filterByDates, filterByUserIds, filters, useFetchDocuments.data]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const setNewFilters = (value: any, name: string) => {
    const newFilters: any = { ...filters };
    newFilters[name] = value;
    setFilters(newFilters);
  };
  return (
    <Container maxWidth={false}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TimeLogFilters onFiltersChange={setNewFilters} filters={filters} user={user} loading={loading} />
        </Grid>
        <Grid item xs={12}>
          <TimeLogDetails
            timeLogEntries={timeLogEntries && timeLogEntries.length > 0 ? timeLogEntries : []}
            loading={useFetchDocuments.isFetching || loadingFilters}
          />
        </Grid>
        <Grid item xs={12}>
          <MainWrapperComponent
            headerProps={{
              title: _VALUES.TIMELOG_ENTRIES,
            }}
          >
            <SimpleTableComponent
              rows={timeLogEntries && timeLogEntries.length > 0 ? timeLogEntries : []}
              values={_VALUES}
              loading={useFetchDocuments.isFetching || loadingFilters}
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
        </Grid>
      </Grid>
    </Container>
  );
};
showRootComponent(<TimelogSummary />);
