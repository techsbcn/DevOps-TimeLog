import React from 'react';
import { showRootTeamsComponent } from '../..';
import { TeamsExtensionType } from '../../enums/TeamsExtensionType';
import TeamsInitializeAuth from '../../components/teamsExt/TeamsInitializeAuth';

export const TimeLogTeamsSummary: React.FC = () => {
  return <TeamsInitializeAuth extensionType={TeamsExtensionType.summary} />;
};

showRootTeamsComponent(<TimeLogTeamsSummary />);
