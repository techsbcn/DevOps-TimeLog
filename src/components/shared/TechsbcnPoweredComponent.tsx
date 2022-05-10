import { Box } from '@mui/material';
import React from 'react';
import { _VALUES } from '../../resources/_constants/values';
import techsBCNLogo from './../../../static/techsBCN.png';
import { TextSimpleComponent } from 'techsbcn-storybook';

const TechsbcnPoweredComponent: React.FC = () => {
  const techsbcnUrl = 'https://techsbcn.com/es/';

  return (
    <Box className="techsbcn-powered-component">
      <TextSimpleComponent
        fullWidth
        label={
          <Box fontSize={'1.1rem'} fontWeight="bold" className="main-color">
            {_VALUES.POWERED_BY}
          </Box>
        }
        value={
          <Box>
            <a target="_blank" href={techsbcnUrl} rel="noreferrer">
              <img src={techsBCNLogo} alt="techsLogo" className="techs-bcn-logo" />
            </a>
          </Box>
        }
      />
    </Box>
  );
};

export default TechsbcnPoweredComponent;
