import React, { useEffect, useState } from 'react';
import { UserContext } from '../../interfaces';
import { GetPublicAlias } from '../../redux/profile/profileAPI';
import { CircularProgress, Box } from '@mui/material';
import TimeLogMainSummary from '../../components/timeLogSummary/TimeLogMainSummary';
import { _VALUES } from '../../resources/_constants/values';

interface TimeLogTeamsExtProps {
  projectId: string;
  organization: string;
}

const TimeLogTeamsExt: React.FC<TimeLogTeamsExtProps> = (props) => {
  const [user, setUser] = useState<UserContext>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    GetPublicAlias().then((alias) => {
      setUser({ id: alias.id, displayName: alias.displayName });
      setLoading(false);
    });
  }, []);

  return !loading ? (
    <TimeLogMainSummary documents={[]} loadingDocuments={false} user={user} projectId={props.projectId} />
  ) : (
    <Box textAlign="center" display="flex" alignItems="center" justifyContent="center">
      <CircularProgress className="circular-progress-main-color" />
      <Box ml={2}>{_VALUES.LOADING}...</Box>
    </Box>
  );
};

export default TimeLogTeamsExt;
