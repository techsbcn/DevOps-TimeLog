import React from 'react';
import { showRootTeamsComponent } from '../..';
import { Box, Grid } from '@mui/material';
import illustration from './../../../static/Illustration.png';
import { _VALUES } from '../../resources/_constants/values';

export const TimeLogSuccess: React.FC = () => {
  return (
    <Grid
      container
      textAlign="center"
      height="100vh"
      alignItems="center"
      alignContent="center"
      justifyContent="center"
      spacing={2}
    >
      <Grid item xs={12}>
        <img src={illustration} alt="empty" className="sucessImg" />
      </Grid>
      <Grid item xs={12}>
        <Box fontWeight="Bold" fontSize={20}>
          {_VALUES.SUCCESS_TIME_LOG_TITLE}
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box fontSize={15}>{_VALUES.SUCCESS_TIME_LOG_INFO}</Box>
      </Grid>
    </Grid>
  );
};

showRootTeamsComponent(<TimeLogSuccess />, true);
