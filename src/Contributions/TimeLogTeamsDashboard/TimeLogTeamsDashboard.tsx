import React from 'react';
import { showRootTeamsComponent } from '../..';
import TeamsInitializeAuth from '../../components/teamsExt/TeamsInitializeAuth';
import { TeamsExtensionType } from '../../enums/TeamsExtensionType';

export const TimeLogTeamsDashboard: React.FC = () => {
  return <TeamsInitializeAuth extensionType={TeamsExtensionType.dashboard} />;
};
showRootTeamsComponent(<TimeLogTeamsDashboard />);
