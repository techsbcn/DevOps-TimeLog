import React, { useEffect, useState } from 'react';
import { Grid, CircularProgress, Box } from '@mui/material';
import { TimeLogEntry, TimeLogEntryFilters, UserContext } from '../../interfaces';
import * as _ from 'lodash';
import TimeLogDetails from '../../components/timeLogSummary/TimeLogDetails';
import TimeLogTable from '../../components/timeLogSummary/TimeLogTable';
import TimeLogFilters from '../../components/timeLogSummary/TimeLogFilters';
import { _VALUES } from '../../resources/_constants/values';
import { GroupBy, useAppSelector, useAppDispatch } from '../../helpers';
import { getCoreState } from '../../redux/store';
import { GetParentsWorkItemsNode } from '../../redux/workItem/workItemAPI';
import { apiSlice } from '../../redux/apiSlice';

interface TimeLogMainSummaryProps {
  documents: TimeLogEntry[];
  loadingDocuments: boolean;
  user?: UserContext;
}

const TimeLogMainSummary: React.FC<TimeLogMainSummaryProps> = (props) => {
  const dispatch = useAppDispatch();
  const { context, config } = useAppSelector(getCoreState);
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

  const filterByProject = React.useCallback(
    (array: any[]) => {
      const workItemsGroup = Object.entries(GroupBy(_.cloneDeep(array), (s) => s.workItemId));
      if (workItemsGroup && workItemsGroup.length > 0) {
        let count = 0;
        const workItemsIds: number[] = [];
        workItemsGroup.map(async (i: any) => {
          await dispatch(
            apiSlice.endpoints.fetchGetWorkItem.initiate({
              workItem: Number(i[0]),
              organizationName: config.organization?.label,
              projectId: config.project?.value,
              token: config.token,
            })
          ).then((result: any) => {
            count++;
            if (result.data && result.data.length > 0) {
              if (result.data[0].WorkItemId) {
                workItemsIds.push(result.data[0].WorkItemId);
              }
            }
          });
          if (count === workItemsGroup.length) {
            setTimeLogEntries(array.filter((item: any) => workItemsIds && workItemsIds.includes(item.workItemId)));
            setLoadingFilters(false);
          }
        });
      } else {
        setTimeLogEntries(array);
        setLoadingFilters(false);
      }
    },
    [config.organization?.label, config.project?.value, config.token, dispatch]
  );

  const loadDocuments = React.useCallback(() => {
    if (filters && props.documents.length > 0) {
      setLoadingFilters(true);
      let documents = filters && filters.userIds ? _.cloneDeep(props.documents) : [];
      documents = filterByDates(documents);
      documents = filterByUserIds(documents);
      filterByProject(_.orderBy(documents, 'date', 'asc'));
      /*setTimeLogEntries(_.orderBy(documents, 'date', 'asc'));
      setLoadingFilters(false);*/
    } else if (filters && props.documents.length === 0) {
      setLoadingFilters(false);
    }
  }, [filterByDates, filterByUserIds, filters, props.documents, filterByProject]);

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
          projectId={config.project?.value}
          contextType={context}
        />
      </Grid>
      <Grid item xs={12}>
        <TimeLogDetails
          timeLogEntries={!loadingFilters && timeLogEntries && timeLogEntries.length > 0 ? timeLogEntries : []}
          loading={props.loadingDocuments || loadingFilters}
        />
      </Grid>
      <Grid item xs={12}>
        <TimeLogTable
          documents={!loadingFilters && timeLogEntries && timeLogEntries.length > 0 ? timeLogEntries : []}
          loading={props.loadingDocuments || loadingFilters}
          urlWorkItem={`https://dev.azure.com/${config.organization?.label}/${config.project?.value}/_workitems/edit`}
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
