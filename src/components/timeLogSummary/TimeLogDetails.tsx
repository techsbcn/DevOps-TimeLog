import React, { useEffect, useState } from 'react';
import { TimeLogEntry } from '../../interfaces';
import { MainWrapperComponent, TextSimpleComponent } from 'techsbcn-storybook';
import { _VALUES } from '../../resources/_constants/values';
import { Grid, Box } from '@mui/material';
import { setTimeFormat } from '../../helpers/TimeHelper';
import { GroupBy } from '../../helpers/GroupBy';

interface TimeLogDetailsProps {
  timeLogEntries: TimeLogEntry[];
  loading: boolean;
}

const TimeLogDetails: React.FC<TimeLogDetailsProps> = (props) => {
  const [total, setTotal] = useState('');
  const [avarage, setAvarage] = useState('');

  useEffect(() => {
    let totalTime = 0;
    props.timeLogEntries.length > 0 && props.timeLogEntries.map((entry) => (totalTime += entry.time));
    setTotal(setTimeFormat(totalTime));
  }, [props.timeLogEntries]);

  useEffect(() => {
    let totalTime = 0;
    if (props.timeLogEntries.length > 0) {
      const timeLogEntriesGrouped =
        props.timeLogEntries.length > 0 && GroupBy(JSON.parse(JSON.stringify(props.timeLogEntries)), (s) => s.date);
      Object.entries(timeLogEntriesGrouped).map((items: any) => {
        items[1].map((entry: any) => (totalTime += entry.time));
      });
      totalTime = totalTime / Object.entries(timeLogEntriesGrouped).length;
    }
    setAvarage(setTimeFormat(totalTime, true));
  }, [props.timeLogEntries]);

  return (
    <MainWrapperComponent
      headerProps={{
        title: _VALUES.SUMMARY,
      }}
    >
      <Grid container>
        <Grid item xs={12} md={4}>
          <TextSimpleComponent
            fullWidth
            value={
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={6}>
                  <Box textAlign="end" fontWeight="bold" className="main-color">
                    {_VALUES.TOTAL}:
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box fontWeight="bold">{total}</Box>
                </Grid>
              </Grid>
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextSimpleComponent
            fullWidth
            value={
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={6}>
                  <Box textAlign="end" fontWeight="bold" className="main-color">
                    {_VALUES.ENTRIES_COUNT}:
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box fontWeight="bold">{props.timeLogEntries.length}</Box>
                </Grid>
              </Grid>
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextSimpleComponent
            fullWidth
            value={
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={6}>
                  <Box textAlign="end" fontWeight="bold" className="main-color">
                    {_VALUES.AVARAGE_PER_DAY}:
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box fontWeight="bold">{avarage}</Box>
                </Grid>
              </Grid>
            }
          />
        </Grid>
      </Grid>
    </MainWrapperComponent>
  );
};

export default TimeLogDetails;
