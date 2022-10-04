import {
  Avatar,
  Checkbox,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import React, { useEffect, useCallback, useState } from 'react';
import { MainWrapperComponent, SimpleTableComponent } from 'techsbcn-storybook';
import { TimeLogEntry, TimeLogEntryFilters } from '../../interfaces';
import { _VALUES } from '../../resources';
import _ from 'lodash';
import { GroupBy } from '../../helpers/GroupBy';
import { getDaysFromMinutes, getHoursFromMinutesFixed } from '../../helpers';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface DashboardWeeklyTimeLoggedProps {
  workItems: TimeLogEntry[];
  loading: boolean;
  members?: any[];
  filters: TimeLogEntryFilters;
  loadingMembers: boolean;
}

const DashboardWeeklyTimeLogged: React.FC<DashboardWeeklyTimeLoggedProps> = (props) => {
  const [checked, setChecked] = React.useState<{ id: string; name: string }[]>([]);
  const [columns, setColumns] = React.useState<
    { id: string; label: string; maxWidth?: number; rowViewFormat?: (row: any) => void; isUnique?: boolean }[]
  >([{ id: 'week', label: _VALUES.WEEK, maxWidth: 100 }]);

  const handleToggle = (value: string, name: string) => {
    const currentIndex = checked.findIndex((x) => x.id === value);
    const newChecked = [...checked];
    const initials = _.deburr(name)
      .match(/\b(\w)/g)
      ?.join('');
    const currentColumnIndex = columns.findIndex((x) => x.id === value);
    const newColumn = [...columns];

    if (currentIndex === -1) {
      newChecked.push({ id: value, name: name });
    } else {
      newChecked.splice(currentIndex, 1);
    }

    if (currentColumnIndex === -1 && initials) {
      newColumn.push({
        id: value,
        label: initials,
        isUnique: true,
        rowViewFormat: (row) =>
          `${getDaysFromMinutes(row[`${value}`] ?? 0)}d (${getHoursFromMinutesFixed(row[`${value}`] ?? 0)}h)`,
      });
    } else {
      newColumn.splice(currentColumnIndex, 1);
    }
    setColumns(newColumn);
    setChecked(newChecked);
  };

  const [weeks, setWeeks] = React.useState<{ startWeek: string; endWeek: string }[]>([]);

  const startOfWeek = useCallback((dt: Date) => {
    return new Date(new Date(dt.setDate(dt.getDate() - dt.getDay() + (dt.getDay() == 0 ? -6 : 1))).setHours(0, 0, 0));
  }, []);

  const endOfWeek = useCallback((dt: Date) => {
    return new Date(new Date(dt.setDate(dt.getDate() - dt.getDay() + (dt.getDay() == 0 ? 0 : 7))).setHours(23, 59, 59));
  }, []);

  const weeksBetween = useCallback(
    (d1: Date, d2: Date) => {
      const res = Math.ceil((startOfWeek(d2).getTime() - startOfWeek(d1).getTime()) / (7 * 24 * 60 * 60 * 1000));
      return res;
    },
    [startOfWeek]
  );
  const [weekList, setWeekList] = React.useState<{ week: string }[]>([]);

  useEffect(() => {
    if (weekList && weekList.length > 0 && props.members && props.members.length > 0) {
      const users: { id: string; name: string }[] = [];
      const newColumn = [...columns];
      props.members
        .sort((a, b) => {
          return a.displayName.localeCompare(b.displayName);
        })
        .map((member) => {
          const currentColumnIndex = newColumn.findIndex((x) => x.id === member.id);
          if (weekList.find((item: any) => item[`${member.id}`])) {
            users.push({ id: member.id, name: member.displayName });
            const initials = _.deburr(member.displayName)
              .match(/\b(\w)/g)
              ?.join('');

            currentColumnIndex === -1 &&
              initials &&
              newColumn.push({
                id: member.id,
                label: initials,
                isUnique: true,
                rowViewFormat: (row) =>
                  `${getDaysFromMinutes(row[`${member.id}`] ?? 0)}d (${getHoursFromMinutesFixed(
                    row[`${member.id}`] ?? 0
                  )}h)`,
              });
          } else {
            if (currentColumnIndex !== -1) newColumn.splice(currentColumnIndex, 1);
          }
        });
      setColumns(newColumn);
      setChecked(users);
    }
  }, [props.members, weekList]);

  useEffect(() => {
    if (props.filters && props.filters.timeTo && props.filters.timeFrom) {
      const start = new Date(props.filters.timeFrom);
      const end = new Date(props.filters.timeTo);
      const arr: { startWeek: string; endWeek: string }[] = [];
      for (let i = 0; i <= weeksBetween(_.cloneDeep(start), _.cloneDeep(end)); i++) {
        let startWeek = arr.length > 0 ? new Date(_.cloneDeep(arr[i - 1].endWeek)) : _.cloneDeep(start);

        if (arr.length > 0) {
          startWeek = startOfWeek(new Date(startWeek.setDate(startWeek.getDate() + 1)));
        }
        const endWeek = endOfWeek(_.cloneDeep(startWeek));

        arr.push({
          endWeek: endWeek <= end ? endWeek.toLocaleDateString('sv-SE') : end.toLocaleDateString('sv-SE'),
          startWeek: startWeek.toLocaleDateString('sv-SE'),
        });
      }
      setWeeks(arr);
    }
  }, [endOfWeek, props.filters, startOfWeek, weeksBetween]);

  const [weeksLoading, setLoadingWeeks] = React.useState(true);

  useEffect(() => {
    if (weeks && weeks.length > 0) {
      setLoadingWeeks(true);
      const arr: { week: string }[] = [];
      weeks.map((week) => {
        const item: { week: string } = {
          week: `${new Date(week.startWeek).toLocaleDateString()} - ${new Date(week.endWeek).toLocaleDateString()}`,
        };
        const workItemsGroup = Object.entries(
          GroupBy(
            _.cloneDeep(props.workItems).filter(
              (item: any) => week.endWeek && week.startWeek && item.date >= week.startWeek && item.date <= week.endWeek
            ),
            (s) => s.userId
          )
        );
        workItemsGroup.map((i: any) => {
          if (i[1][0].userId) {
            let totalTime = 0;
            i[1].map((t: any) => (totalTime += t.time));
            item[`${i[1][0].userId}`] = totalTime;
          }
        });
        arr.push(item);
      });
      setWeekList(arr);
      setLoadingWeeks(false);
    }
  }, [weeks, props.workItems]);

  const [expand, setExpand] = useState<boolean>(false);

  const onToggle = () => {
    setExpand(!expand);
  };
  return (
    <MainWrapperComponent
      headerProps={{
        title: _VALUES.WEEKLY_TIME_LOGGED,
      }}
      loadingChildren={props.loading}
    >
      <Grid container spacing={4}>
        <Grid item xs={12} md={9} sx={{ order: { xs: '2', md: '1' } }}>
          <SimpleTableComponent
            rows={weekList && weekList.length > 0 ? weekList : []}
            loading={weeksLoading}
            columns={columns && columns.length > 0 ? columns : []}
            values={_VALUES}
            className="table-dashboard"
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ order: { xs: '1', md: '2' } }}>
          <MainWrapperComponent
            headerProps={{
              title: _VALUES.PEOPLE,
              actions: [{ children: <ExpandMoreIcon onClick={onToggle} /> }],
            }}
            loadingChildren={props.loadingMembers}
            height="auto"
          >
            {checked && checked.length > 0 && (
              <Grid container spacing={0.5}>
                {checked.map((user) => {
                  const member =
                    props.members && props.members.length > 0 && props.members.find((x) => x.id === user.id);
                  if (member) {
                    const initials = user
                      ? _.deburr(user.name)
                          .match(/\b(\w)/g)
                          ?.join('')
                      : '';
                    return (
                      <Grid item xs={4} key={user.id}>
                        <Chip
                          avatar={<Avatar alt={`Avatar n°${user.id + 1}`} src={member.imageUrl} />}
                          label={`${initials}`}
                          variant="outlined"
                          onDelete={() => handleToggle(user.id, user.name)}
                        />
                      </Grid>
                    );
                  }
                })}
              </Grid>
            )}
            {expand && (
              <List dense>
                {props.members &&
                  props.members.length > 0 &&
                  props.members
                    .sort((a, b) => {
                      return a.displayName.localeCompare(b.displayName);
                    })
                    .map((x: any) => {
                      const labelId = `checkbox-list-secondary-label-${x.id}`;
                      return (
                        <ListItem key={x.id}>
                          <ListItemButton onClick={() => handleToggle(x.id, x.displayName)}>
                            <ListItemIcon>
                              <Checkbox
                                edge="start"
                                onChange={() => handleToggle(x.id, x.displayName)}
                                checked={checked.findIndex((item) => item.id === x.id) !== -1}
                                inputProps={{ 'aria-labelledby': labelId }}
                              />
                            </ListItemIcon>
                            <ListItemAvatar>
                              <Avatar alt={`Avatar n°${x.id + 1}`} src={x.imageUrl} />
                            </ListItemAvatar>
                            <ListItemText id={labelId} primary={x.displayName} />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
              </List>
            )}
          </MainWrapperComponent>
        </Grid>
      </Grid>
    </MainWrapperComponent>
  );
};

export default DashboardWeeklyTimeLogged;
