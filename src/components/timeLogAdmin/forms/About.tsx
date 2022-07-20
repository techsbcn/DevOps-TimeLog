import { Box, Grid } from '@mui/material';
import React from 'react';
import { MainWrapperComponent } from 'techsbcn-storybook';
import { _VALUES } from '../../../resources/_constants/values';
import TechsbcnPoweredComponent from '../../shared/TechsbcnPoweredComponent';
import { TextSimpleComponent } from 'techsbcn-storybook';

interface AboutProps {
  version: string;
}

const About: React.FC<AboutProps> = (props) => {
  return (
    <MainWrapperComponent
      headerProps={{
        title: _VALUES.ABOUT_TIMELOG_FOR_AZURE_DEVOPS,
      }}
    >
      <Grid container flexDirection="column" spacing={3}>
        <Grid item>
          <TextSimpleComponent
            fullWidth
            label={
              <Box fontSize={'1.1rem'} fontWeight="bold" className="main-color">
                {_VALUES.VERSION}
              </Box>
            }
            value={<Box>{props.version}</Box>}
          />
        </Grid>
        <Grid item>
          <TextSimpleComponent
            fullWidth
            label={
              <Box fontSize={'1.1rem'} fontWeight="bold" className="main-color">
                {_VALUES.CONTACT}
              </Box>
            }
            value={
              <a className="hover-underline" href={`mailto:yamilet@techsbcn.com`}>
                yamilet@techsbcn.com
              </a>
            }
          />
        </Grid>
        <Grid item>
          <TechsbcnPoweredComponent />
        </Grid>
      </Grid>
    </MainWrapperComponent>
  );
};

export default About;
