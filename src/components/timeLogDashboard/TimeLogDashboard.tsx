import React, { useEffect, useState } from 'react';
import { TimeLogEntry, TimeLogEntryFilters } from '../../interfaces';
import { Grid, CircularProgress, Box } from '@mui/material';
import { _VALUES } from '../../resources/_constants/values';
import * as _ from 'lodash';
import DashboardStats from './DashboardStats';
import DashboardWeeklyTimeLogged from './DashboardWeeklyTimeLogged';
import { SearchComponent, SelectField, TextFieldComponent, AppHeader } from 'techsbcn-storybook';
import { useAppSelector, SelectAsyncHelper, GroupBy, useAppDispatch } from '../../helpers';
import { GetTeams, GetTeamMembers } from '../../redux/core/coreAPI';
import { getCoreState } from '../../redux/store';
import { apiSlice } from '../../redux/apiSlice';

interface TimeLogDashboardProps {
  documents: TimeLogEntry[];
  loadingDocuments: boolean;
}

const TimeLogDashboard: React.FC<TimeLogDashboardProps> = (props) => {
  const dispatch = useAppDispatch();
  const { context, config } = useAppSelector(getCoreState);
  const [timeLogEntries, setTimeLogEntries] = useState<TimeLogEntry[]>();

  const [filters, setFilters] = useState<TimeLogEntryFilters>(() => {
    const curr = new Date();

    return {
      timeFrom: new Date(
        new Date(curr.setDate(curr.getDate() - curr.getDay() + (curr.getDay() == 0 ? -6 : 1))).setHours(0, 0, 0)
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
      let documents = _.cloneDeep(props.documents);
      documents = filterByDates(documents);
      //filterByProject(_.orderBy(documents, 'date', 'asc'));
      setTimeLogEntries(_.orderBy(documents, 'date', 'asc'));
      setLoadingFilters(false);
    } else if (filters && props.documents.length === 0) {
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

  const [teams, setTeams] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [teamSelected, setTeamSelected] = useState<any>();
  const [loadingMembers, setLoadingMembers] = useState<boolean>(true);

  useEffect(() => {
    setLoadingMembers(true);
    GetTeams(context, config.project?.value)
      .then((result) => {
        const resultTransform = SelectAsyncHelper(result);
        setTeams(resultTransform);
        setTeamSelected(resultTransform[0]);
      })
      .catch(() => setLoadingMembers(false));
  }, [config.project?.value, context]);

  const loadMembers = React.useCallback(() => {
    if (teamSelected) {
      GetTeamMembers(teamSelected.value, context, config.project?.value)
        .then((members) => {
          setMembers(members);
          setLoadingMembers(false);
        })
        .catch(() => setLoadingMembers(false));
    }
  }, [config.project?.value, context, teamSelected]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const ListFilters = () => {
    const filterList: any[] = [];
    teams &&
      teams?.length > 0 &&
      filterList.push({
        singleFilter: (
          <SelectField
            name="teams"
            label={_VALUES.TEAMS}
            options={teams}
            value={teamSelected && teamSelected}
            isClearable={false}
            onChangeOption={(options) => {
              setTeamSelected(options);
            }}
          />
        ),
      });
    filterList.push({
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
              setNewFilters(!isNaN(date.valueOf()) ? date.toLocaleDateString('sv-SE') : e.target.value, e.target.name);
            }, 1000)}
          />
        ),
      },
    });

    return filterList;
  };

  return !props.loadingDocuments ? (
    <Box mt={-2}>
      <AppHeader>
        <Box width="100%">
          <SearchComponent filters={!loadingMembers ? ListFilters() : []} filtersSize={6} />
        </Box>
      </AppHeader>
      <Box mt={1}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <DashboardStats
              loading={props.loadingDocuments || loadingFilters}
              workItems={!loadingFilters && timeLogEntries && timeLogEntries.length > 0 ? timeLogEntries : []}
              members={members}
            />
          </Grid>
          <Grid item xs={12}>
            <DashboardWeeklyTimeLogged
              loading={props.loadingDocuments || loadingFilters}
              workItems={!loadingFilters && timeLogEntries && timeLogEntries.length > 0 ? timeLogEntries : []}
              members={members}
              filters={filters}
              loadingMembers={loadingMembers}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  ) : (
    <Box textAlign="center" display="flex" alignItems="center" justifyContent="center">
      <CircularProgress className="circular-progress-main-color" />
      <Box ml={2}>{_VALUES.LOADING}...</Box>
    </Box>
  );
};

export default TimeLogDashboard;
