import React, { useEffect, useState } from 'react';
import { TimeLogEntry, TimeLogEntryFilters } from '../../interfaces';
import { Grid, CircularProgress, Box } from '@mui/material';
import { _VALUES } from '../../resources/_constants/values';
import * as _ from 'lodash';
import DashboardStats from './DashboardStats';
import DashboardWeeklyTimeLogged from './DashboardWeeklyTimeLogged';
import { SearchComponent, SelectField, TextFieldComponent, AppHeader } from 'techsbcn-storybook';
import { useAppSelector, SelectAsyncHelper } from '../../helpers';
import { GetTeams, GetTeamMembers } from '../../redux/core/coreAPI';
import { getCoreState } from '../../redux/store';

interface TimeLogDashboardProps {
  documents: TimeLogEntry[];
  loadingDocuments: boolean;
}

const TimeLogDashboard: React.FC<TimeLogDashboardProps> = (props) => {
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

  const loadDocuments = React.useCallback(() => {
    if (filters && props.documents.length > 0) {
      setLoadingFilters(true);
      let documents = _.cloneDeep(props.documents);
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
          <SearchComponent filters={!loadingFilters ? ListFilters() : []} filtersSize={6} />
        </Box>
      </AppHeader>
      <Box mt={1}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <DashboardStats
              loading={loadingFilters}
              workItems={timeLogEntries && timeLogEntries.length > 0 ? timeLogEntries : []}
              members={members}
            />
          </Grid>
          <Grid item xs={12}>
            <DashboardWeeklyTimeLogged
              loading={loadingFilters}
              workItems={timeLogEntries && timeLogEntries.length > 0 ? timeLogEntries : []}
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
