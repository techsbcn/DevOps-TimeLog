import React from 'react';
import { showRootTeamsComponent } from '../..';
import TeamsInitializeAuth from '../../components/teamsExt/TeamsInitializeAuth';
import { TeamsExtensionType } from '../../enums/TeamsExtensionType';

export const TimeLogTeamsEntries: React.FC = () => {
  return <TeamsInitializeAuth extensionType={TeamsExtensionType.newTimeLog} />;
};

showRootTeamsComponent(<TimeLogTeamsEntries />, true);
