import React from 'react';
import { showRootTeamsComponent } from '../..';
import { Box, Grid } from '@mui/material';
import illustration from './../../../static/Illustration.png';
import { _VALUES } from '../../resources/_constants/values';
import { Button } from '@fluentui/react-northstar';

interface TimeLogSuccessProps {
  actionButton?: {
    title: string;
    action: () => void;
  };
}
export const TimeLogSuccess: React.FC<TimeLogSuccessProps> = (props) => {
  return (
    <Grid
      container
      textAlign="center"
      height="100vh"
      alignItems="center"
      alignContent="center"
      justifyContent="center"
      spacing={1}
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
      {props.actionButton && (
        <Grid item xs={12}>
          <Button primary content={props.actionButton.title} onClick={props.actionButton.action} />
        </Grid>
      )}
    </Grid>
  );
};

showRootTeamsComponent(<TimeLogSuccess />, true);
