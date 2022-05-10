import React from 'react';
import { showRootTeamsComponent } from '../..';
import { TeamsExtensionType } from '../../enums/TeamsExtensionType';
import TeamsInitializeAuth from '../../components/teamsExt/TeamsInitializeAuth';

export const TimeLogTeamsConfig: React.FC = () => {
  return <TeamsInitializeAuth extensionType={TeamsExtensionType.config} />;
};

showRootTeamsComponent(<TimeLogTeamsConfig />);
