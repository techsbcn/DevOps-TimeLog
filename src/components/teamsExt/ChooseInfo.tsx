import React, { useEffect, useState } from 'react';
import { _VALUES } from '../../resources/_constants/values';
import { MainWrapperComponent, SelectField } from 'techsbcn-storybook';
import { GetPublicAlias } from '../../redux/profile/profileAPI';
import { GetOrganizations, GetProjects } from '../../redux/core/coreAPI';
import { Grid, Box, CircularProgress } from '@mui/material';
import { Button } from '@fluentui/react-northstar';
import CheckExtension from '../../components/teamsExt/CheckExtension';
import { TeamsExtensionType } from '../../enums/TeamsExtensionType';
import { ErrorIcon } from '@fluentui/react-icons-northstar';
import { GetOrganizationObjectTL, GetProjectObjectTL } from '../../helpers/RequestHeaders';
import { SelectAsyncHelper } from '../../helpers/SelectHelper';
import { addOrganization, addProject } from '../../redux/core/coreSlice';
import { ContextType } from '../../enums/ContextType';
import { useAppDispatch } from '../../helpers/hooks';

interface ChooseInfoProps {
  extensionType: TeamsExtensionType;
}

const ChooseInfo: React.FC<ChooseInfoProps> = (props) => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [organizationSelected, setOrganizationSelected] = useState<any>(GetOrganizationObjectTL());
  const [projects, setProjects] = useState<any[]>();
  const [projectSelected, setProjectSelected] = useState<any>(GetProjectObjectTL());

  const loadOrganizations = React.useCallback(() => {
    setLoading(true);
    GetPublicAlias().then((alias) => {
      GetOrganizations(alias.publicAlias)
        .then((organizations) => {
          const resultTransform = SelectAsyncHelper(organizations);
          setOrganizations(resultTransform);
          resultTransform.length === 1 && setOrganizationSelected(resultTransform[0]);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    });
  }, []);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const loadProjects = React.useCallback(() => {
    if (organizationSelected) {
      setLoadingProjects(true);
      GetProjects(organizationSelected.label)
        .then((projects) => {
          const resultTransform = SelectAsyncHelper(projects);
          setProjects(resultTransform);
          setLoadingProjects(false);
        })
        .catch(() => {
          setLoadingProjects(false);
        });
    }
  }, [organizationSelected]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const saveInfo = () => {
    localStorage.setItem('TL_ORG', JSON.stringify(organizationSelected));
    localStorage.setItem('TL_PROJECT', JSON.stringify(projectSelected));
    dispatch(addOrganization({ contextType: ContextType.TEAMS, organization: organizationSelected }));
    dispatch(addProject({ contextType: ContextType.TEAMS, project: projectSelected }));
    props.extensionType !== TeamsExtensionType.config && setActiveTab(1);
  };

  const tabs = [
    <MainWrapperComponent
      key={0}
      headerProps={{
        title: organizationSelected ? _VALUES.CHOOSE_PROJECTS : _VALUES.CHOOSE_ORGANIZATION,
      }}
    >
      <Grid container spacing={3}>
        {organizations && organizations?.length > 0 ? (
          <Grid item xs={12}>
            <SelectField
              name="organization"
              label={_VALUES.ORGANIZATION}
              options={organizations}
              defaultOptions={organizationSelected && organizationSelected}
              onChangeOption={(options) => {
                setOrganizationSelected(options);
              }}
            />
          </Grid>
        ) : loading ? (
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <CircularProgress className="circular-progress-main-color" />
              <Box ml={2}>{_VALUES.LOADING}...</Box>
            </Box>
          </Grid>
        ) : (
          !loading &&
          organizations.length === 0 && (
            <>
              <Grid item xs={12}>
                <Box mt={1} fontWeight="Bold" fontSize={20} display="flex" alignItems="center">
                  {_VALUES.UNABLE_ORGANIZATION}
                  <Box ml={2}>
                    <ErrorIcon size="larger" />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Button primary content={_VALUES.TRY_AGAIN} onClick={loadOrganizations} />
              </Grid>
            </>
          )
        )}
        {organizationSelected && projects && projects.length > 0 ? (
          <Grid item xs={12}>
            <SelectField
              name="project"
              label={_VALUES.PROJECT}
              options={projects}
              defaultOptions={projectSelected && projectSelected}
              isClearable={false}
              onChangeOption={(options) => {
                setProjectSelected(options);
              }}
            />
          </Grid>
        ) : organizationSelected && loadingProjects ? (
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <CircularProgress className="circular-progress-main-color" />
              <Box ml={2}>{_VALUES.LOADING}...</Box>
            </Box>
          </Grid>
        ) : (
          !loadingProjects &&
          organizationSelected &&
          !projects && (
            <>
              <Grid item xs={12}>
                <Box mt={1} fontWeight="Bold" fontSize={20} display="flex" alignItems="center">
                  {_VALUES.UNABLE_PROJECT}
                  <Box ml={2}>
                    <ErrorIcon size="larger" />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Button primary content={_VALUES.TRY_AGAIN} onClick={loadProjects} />
              </Grid>
            </>
          )
        )}
        {organizations && organizations?.length > 0 && projects && projects.length > 0 && (
          <Grid item xs={12}>
            <Button
              primary
              content={props.extensionType === TeamsExtensionType.config ? _VALUES.SAVE : _VALUES.CONTINUE}
              onClick={saveInfo}
              disabled={!organizationSelected || !projectSelected}
            />
          </Grid>
        )}
      </Grid>
    </MainWrapperComponent>,
    <CheckExtension key={1} extensionType={props.extensionType} />,
  ];
  const renderTabContent = (tab: number) => {
    return tabs[tab];
  };

  return renderTabContent(activeTab);
};

export default ChooseInfo;
