import React, { useEffect, useState } from 'react';
import { _VALUES } from '../../resources/_constants/values';
import { CircularProgress, Box, Avatar } from '@mui/material';
import { Button } from '@fluentui/react-northstar';
import TimeLogTeamsExt from './TimeLogTeamsExt';
import noExtensionImg from './../../../static/notFoundExtension.png';
import { CheckInstalledExtension } from '../../redux/extensionDataManager/extensionDataManagerAPI';
import { TeamsExtensionType } from '../../enums/TeamsExtensionType';
import { useAppSelector } from '../../helpers/hooks';
import { getCoreState } from '../../redux/store';

interface CheckExtensionProps {
  extensionType: TeamsExtensionType;
}

const CheckExtension: React.FC<CheckExtensionProps> = (props) => {
  const [noExtension, setNoExtension] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const HandleCheckExtension = React.useCallback(() => {
    setLoading(true);
    CheckInstalledExtension()
      .then((response) => {
        if (response) {
          setNoExtension(false);
        } else {
          setNoExtension(true);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    HandleCheckExtension();
  }, [HandleCheckExtension]);

  return !loading ? (
    noExtension ? (
      <Box textAlign="center">
        <Box mb={2}>
          <Avatar
            src={noExtensionImg}
            className="object-contain"
            alt="noExtension"
            variant="square"
            sx={{ height: '450px', width: '100%' }}
          />
          <Box mt={1} fontWeight="Bold" fontSize={20}>
            {_VALUES.NO_EXTENSION_MESSAGE}
            <Box>
              <a
                className="afn"
                target="_blank"
                href={'https://marketplace.visualstudio.com/items?itemName=TechsBCN.DevOps-TimeLog'}
                rel="noreferrer"
              >
                TimeLog for DevOps
              </a>
            </Box>
          </Box>
        </Box>
        <Button primary content={_VALUES.TRY_AGAIN} onClick={() => HandleCheckExtension()} />
      </Box>
    ) : (
      <TimeLogTeamsExt extensionType={props.extensionType} />
    )
  ) : (
    <Box textAlign="center" display="flex" alignItems="center" justifyContent="center">
      <CircularProgress className="circular-progress-main-color" />
      <Box ml={2}>{_VALUES.LOADING}...</Box>
    </Box>
  );
};

export default CheckExtension;
