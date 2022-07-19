import { Box, Grid } from '@mui/material';
import React from 'react';
import { _VALUES } from '../../resources/_constants/values';
import techsBCNLogo from './../../../static/techsBCN.png';
import Logo from './../../../images/logo.png';

const NavbarTechsbcnPoweredComponent: React.FC = () => {
  const techsbcnUrl = 'https://techsbcn.com/es/';
  const extensionURL = 'https://marketplace.visualstudio.com/items?itemName=TechsBCN.DevOps-TimeLog';
  return (
    <Box className="navbar-techsbcn-powered-component">
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Box>
            <a target="_blank" href={extensionURL} rel="noreferrer">
              <img src={Logo} alt="logo" className="techs-bcn-logo" />
            </a>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box mt={0.5} display="flex" alignContent="end" justifyContent="end" alignItems="center">
            <Box mr={1} fontSize={'1rem'} fontWeight="bold" className="main-color">
              {_VALUES.POWERED_BY}
            </Box>
            <a target="_blank" href={techsbcnUrl} rel="noreferrer">
              <img src={techsBCNLogo} alt="techsLogo" className="techs-bcn-logo" />
            </a>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NavbarTechsbcnPoweredComponent;
