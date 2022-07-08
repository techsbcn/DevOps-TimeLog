import React, { useEffect, useState, useCallback } from 'react';
import { MainWrapperComponent, SelectField, SimpleTableComponent } from 'techsbcn-storybook';
import { _VALUES } from '../../resources/_constants/values';
import {
  GetParentRecursive,
  GetEpicsWorkItemsNode,
  GetTagsNodeAPI,
  GetParentsWorkItemsNode,
} from '../../redux/workItem/workItemAPI';
import { TimeLogEntry, ChartMap } from '../../interfaces';
import { Grid, Box, CircularProgress } from '@mui/material';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import highcharts3d from 'highcharts/highcharts-3d';
import { ChartType } from '../../enums/ChartType';
import { TimeLoggedGroupedType } from '../../enums/TimeLoggedGroupedType';
import { GroupBy } from '../../helpers/GroupBy';
import { getDaysFromMinutes, getHoursFromMinutes } from '../../helpers/TimeHelper';
import { EnumToSelect, SelectEnum } from '../../helpers/EnumHelper';
import { useAppSelector, usePrevious } from '../../helpers/hooks';
import { getCoreState } from '../../redux/store';
import _ from 'lodash';

highcharts3d(Highcharts);

interface DashboardStatsProps {
  workItems: TimeLogEntry[];
  loading: boolean;
  members?: any[];
}

const DashboardStats: React.FC<DashboardStatsProps> = (props) => {
  const { config } = useAppSelector(getCoreState);
  const [chartTye, setChartType] = React.useState<ChartType>(ChartType.TIME_LOGGED_GROUPED);
  const [timeLoggedGroupedType, setTimeLoggedGroupedType] = React.useState<TimeLoggedGroupedType>(
    TimeLoggedGroupedType.AREAPATH
  );

  const [chartMaps, setChartMaps] = useState<ChartMap[]>();
  const [workItemsLoading, setWorkItemsLoading] = React.useState(false);

  const prevWorkItemsState = usePrevious(JSON.stringify(props.workItems));
  const prevTimeLoggedGroupedType = usePrevious(timeLoggedGroupedType);

  const LoadByAreaPath = useCallback(
    (chartMapList: ChartMap[]) => {
      GetEpicsWorkItemsNode(config.organization?.label, config.project?.value, config.token).then((result: any) => {
        result.map((x: any) => {
          chartMapList.push({ id: x.WorkItemId, y: 0, name: x.Title });
        });
      });
      const workItemsParent: ChartMap[] = [];
      const workItemsGroup = Object.entries(GroupBy(_.cloneDeep(props.workItems), (s) => s.workItemId));
      let count = 0;
      workItemsGroup.map(async (i: any) => {
        await GetParentRecursive(i[0], config.organization?.label, config.project?.value, config.token).then(
          (result: any) => {
            count++;
            let totalTime = 0;
            i[1].map((t: any) => (totalTime += t.time));
            workItemsParent.push({
              id: result.WorkItemId,
              y: totalTime,
              name: result.Title,
            });
          }
        );
        workItemsParent.length === workItemsGroup.length &&
          Object.entries(GroupBy(_.cloneDeep(workItemsParent), (s) => s.id)).map((g: any) => {
            const workItem = chartMapList.findIndex((x) => x.id === Number(g[0]));
            let totalTime = 0;
            g[1].map((t: any) => (totalTime += t.y));
            if (workItem !== -1) chartMapList[workItem].y = totalTime;
            setChartMaps(chartMapList);
          });
        count === workItemsGroup.length && setWorkItemsLoading(false);
      });
    },
    [config.organization?.label, config.project?.value, config.token, props.workItems]
  );

  const LoadByUser = useCallback(
    (chartMapList: ChartMap[]) => {
      props.members &&
        props.members.map((x: any) => {
          chartMapList.push({ id: x.id, y: 0, name: x.displayName });
        });
      const workItemsGroup = Object.entries(GroupBy(_.cloneDeep(props.workItems), (s) => s.userId));
      let count = 0;
      workItemsGroup.map(async (i: any) => {
        count++;
        const workItem = chartMapList.findIndex((x) => x.id === i[0]);
        let totalTime = 0;
        i[1].map((t: any) => (totalTime += t.time));
        if (workItem !== -1) chartMapList[workItem].y = totalTime;
        setChartMaps(chartMapList);
      });
      count === workItemsGroup.length && setWorkItemsLoading(false);
    },
    [props.members, props.workItems]
  );

  const LoadByTag = useCallback(
    async (chartMapList: ChartMap[]) => {
      await GetTagsNodeAPI(config.project?.value, config.token).then((result: any[]) => {
        result &&
          result.length > 0 &&
          result.map((x: any) => {
            chartMapList.push({ id: x.id, y: 0, name: x.name });
          });
      });
      const workItemsParent: ChartMap[] = [];
      const workItemsGroup = Object.entries(GroupBy(_.cloneDeep(props.workItems), (s) => s.workItemId));
      let count = 0;
      workItemsGroup.map(async (i: any) => {
        await GetParentsWorkItemsNode([i[0]], config.organization?.label, config.project?.value, config.token).then(
          (result: any[]) => {
            count++;
            if (result && result[0].TagNames) {
              let totalTime = 0;
              i[1].map((t: any) => (totalTime += t.time));
              workItemsParent.push({
                id: result[0].WorkItemId,
                y: totalTime,
                name: result[0].TagNames,
              });
            }
          }
        );
        count === workItemsGroup.length &&
          Object.entries(GroupBy(_.cloneDeep(workItemsParent), (s) => s.name)).map((g: any) => {
            const workItem = chartMapList.findIndex((x) => x.name === g[0]);
            let totalTime = 0;
            g[1].map((t: any) => (totalTime += t.y));
            if (workItem !== -1) chartMapList[workItem].y = totalTime;
            setChartMaps(chartMapList);
          });
        count === workItemsGroup.length && setWorkItemsLoading(false);
      });
    },
    [config.organization?.label, config.project?.value, config.token, props.workItems]
  );

  const LoadEmptyCharts = useCallback(
    (chartMapList: ChartMap[]) => {
      switch (timeLoggedGroupedType) {
        case TimeLoggedGroupedType.AREAPATH:
          GetEpicsWorkItemsNode(config.organization?.label, config.project?.value, config.token)
            .then((result: any) => {
              if (result.length > 0) {
                result.map((x: any) => {
                  chartMapList.push({ id: x.WorkItemId, y: 0, name: x.Title });
                });
              }
              setChartMaps(chartMapList);
              setWorkItemsLoading(false);
            })
            .catch(() => {
              setChartMaps(chartMapList);
              setWorkItemsLoading(false);
            });
          break;
        case TimeLoggedGroupedType.USER:
          props.members &&
            props.members.map((x: any) => {
              chartMapList.push({ id: x.id, y: 0, name: x.displayName });
            });
          setChartMaps(chartMapList);
          setWorkItemsLoading(false);
          break;
        case TimeLoggedGroupedType.TAG:
          GetTagsNodeAPI(config.project?.value, config.token)
            .then((result: any[]) => {
              if (result.length > 0) {
                result.map((x: any) => {
                  chartMapList.push({ id: x.id, y: 0, name: x.name });
                });
              }
              setChartMaps(chartMapList);
              setWorkItemsLoading(false);
            })
            .catch(() => {
              setChartMaps(chartMapList);
              setWorkItemsLoading(false);
            });
          break;
      }
    },
    [config.organization?.label, config.project?.value, config.token, props.members, timeLoggedGroupedType]
  );

  useEffect(() => {
    if (prevWorkItemsState != JSON.stringify(props.workItems) || prevTimeLoggedGroupedType != timeLoggedGroupedType) {
      const chartMapList: ChartMap[] = [];
      setWorkItemsLoading(true);
      if (props.workItems.length > 0) {
        switch (timeLoggedGroupedType) {
          case TimeLoggedGroupedType.AREAPATH:
            LoadByAreaPath(chartMapList);
            break;
          case TimeLoggedGroupedType.USER:
            LoadByUser(chartMapList);
            break;
          case TimeLoggedGroupedType.TAG:
            LoadByTag(chartMapList);
            break;
        }
      } else {
        LoadEmptyCharts(chartMapList);
      }
    }
  }, [
    prevWorkItemsState,
    props.workItems,
    timeLoggedGroupedType,
    LoadByAreaPath,
    LoadEmptyCharts,
    prevTimeLoggedGroupedType,
    LoadByUser,
    LoadByTag,
  ]);

  return (
    <MainWrapperComponent
      headerProps={{
        title: _VALUES.STATS,
      }}
    >
      <Grid container spacing={5}>
        <Grid item xs={12} md={6}>
          {chartMaps && chartMaps.length > 0 ? (
            <Box className={workItemsLoading ? 'box-loading-relative' : ''}>
              {workItemsLoading && <CircularProgress className="circular-progress-main-color" />}
              <HighchartsReact
                highcharts={Highcharts}
                options={{
                  colors: ['#286FB7'],
                  credits: {
                    enabled: false,
                  },
                  chart: {
                    type: 'column',
                    options3d: {
                      enabled: true,
                      alpha: 0,
                      beta: 15,
                      depth: 100,
                    },
                  },
                  title: {
                    text: `${_VALUES.TIME_LOGGED_BY} ${_VALUES[TimeLoggedGroupedType[timeLoggedGroupedType]]}`,
                  },
                  plotOptions: {
                    column: {
                      depth: 40,
                    },
                  },
                  xAxis: {
                    type: 'category',
                    labels: {
                      skew3d: true,
                      rotation: -45,
                      style: {
                        fontSize: '14px',
                        fontWeight: 'bold',
                      },
                    },
                  },
                  yAxis: {
                    showEmpty: false,
                    min: 0,
                    title: {
                      text: null,
                    },
                  },
                  legend: {
                    enabled: false,
                  },
                  series: [
                    {
                      name: '',
                      data: chartMaps.sort((a, b) => a.id - b.id),
                    },
                  ],
                }}
              />
            </Box>
          ) : chartMaps && chartMaps.length === 0 && workItemsLoading ? (
            <Box textAlign="center" display="flex" alignItems="center" justifyContent="center">
              <CircularProgress className="circular-progress-main-color" />
              <Box ml={2}>{_VALUES.LOADING}...</Box>
            </Box>
          ) : (
            !workItemsLoading &&
            chartMaps &&
            chartMaps.length === 0 && (
              <Box textAlign="center" display="flex" alignItems="center" justifyContent="center">
                <Box ml={2}>{_VALUES.NO_RESULTS_FOUND}...</Box>
              </Box>
            )
          )}
        </Grid>
        <Grid item xs={12} md={3}>
          <SimpleTableComponent
            rows={chartMaps && chartMaps.length > 0 ? chartMaps.sort((a, b) => a.id - b.id) : []}
            loading={workItemsLoading}
            columns={[
              { id: 'name', label: _VALUES[TimeLoggedGroupedType[timeLoggedGroupedType]] },
              {
                id: 'y',
                label: _VALUES.TIME_LOGGED,
                rowViewFormat: (row) => `${getDaysFromMinutes(row.y)}d (${getHoursFromMinutes(row.y)}h)`,
              },
            ]}
            values={_VALUES}
            className="table-dashboard"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Grid container alignContent="center" spacing={5}>
            <Grid xs={12} item>
              <MainWrapperComponent
                headerProps={{
                  title: _VALUES.CHART_TYPE,
                  filters: [
                    {
                      singleFilter: (
                        <SelectField
                          name={'chartType'}
                          options={EnumToSelect(ChartType)}
                          defaultOptions={SelectEnum(ChartType, [ChartType[chartTye]])}
                          isClearable={false}
                        />
                      ),
                    },
                  ],
                  filtersSize: 12,
                }}
              />
            </Grid>
            <Grid xs={12} item>
              <MainWrapperComponent
                headerProps={{
                  title: _VALUES.GROUP_BY,
                  filters: [
                    {
                      singleFilter: (
                        <SelectField
                          name={'Group By'}
                          options={EnumToSelect(TimeLoggedGroupedType)}
                          defaultOptions={SelectEnum(TimeLoggedGroupedType, [
                            TimeLoggedGroupedType[timeLoggedGroupedType],
                          ])}
                          isClearable={false}
                          onChangeValue={(value) => {
                            setTimeLoggedGroupedType(Number(value));
                          }}
                        />
                      ),
                    },
                  ],
                  filtersSize: 12,
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </MainWrapperComponent>
  );
};

export default DashboardStats;
