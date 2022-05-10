import React, { useEffect, useState } from 'react';
import { _VALUES } from '../../resources/_constants/values';
import { MainWrapperComponent, SelectField } from 'techsbcn-storybook';
import { GetPublicAlias } from '../../redux/profile/profileAPI';
import { GetOrganizations, GetProjects } from '../../redux/core/coreAPI';
import {
  GetOrganizationTL,
  GetProjectTL,
  SelectAsyncHelper,
  GetTokenTL,
  GetProjectObjectTL,
  GetOrganizationObjectTL,
} from '../../helpers';
import { Grid } from '@mui/material';
import { Button } from '@fluentui/react-northstar';
import TimeLogTeamsExt from '../../components/teamsExt/TimeLogTeamsExt';
import { TeamsExtensionType } from '../../enums/TeamsExtensionType';

interface ChooseInfoProps {
  extensionType: TeamsExtensionType;
}

const ChooseInfo: React.FC<ChooseInfoProps> = (props) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [organizationSelected, setOrganizationSelected] = useState<any>(GetOrganizationObjectTL());
  const [projects, setProjects] = useState<any[]>();
  const [projectSelected, setProjectSelected] = useState<any>(GetProjectObjectTL());

  useEffect(() => {
    GetPublicAlias().then((alias) => {
      GetOrganizations(alias.publicAlias).then((organizations) => {
        const resultTransform = SelectAsyncHelper(organizations);
        setOrganizations(resultTransform);
        resultTransform.length === 1 && setOrganizationSelected(resultTransform[0]);
      });
      setLoading(false);
    });
  }, []);

  const loadProjects = React.useCallback(() => {
    if (organizationSelected) {
      GetProjects(organizationSelected.label).then((projects) => {
        const resultTransform = SelectAsyncHelper(projects);
        setProjects(resultTransform);
      });
    }
  }, [organizationSelected]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const saveInfo = () => {
    localStorage.setItem('TL_ORG', JSON.stringify(organizationSelected));
    localStorage.setItem('TL_PROJECT', JSON.stringify(projectSelected));
    props.extensionType !== TeamsExtensionType.config && setActiveTab(1);
  };

  const tabs = [
    <MainWrapperComponent
      key={0}
      headerProps={{
        title: organizationSelected ? _VALUES.CHOOSE_PROJECTS : _VALUES.CHOOSE_ORGANIZATION,
      }}
      loading={loading}
    >
      <Grid container spacing={3}>
        {organizations && organizations?.length > 0 && (
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
        )}
        {organizationSelected && projects && projects.length > 0 && (
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
        )}
        <Grid item xs={12}>
          <Button
            primary
            content={props.extensionType === TeamsExtensionType.config ? _VALUES.SAVE : _VALUES.CONTINUE}
            onClick={saveInfo}
            disabled={!organizationSelected || !projectSelected}
          />
        </Grid>
      </Grid>
    </MainWrapperComponent>,
    <TimeLogTeamsExt
      key={1}
      projectId={GetProjectTL()}
      organization={GetOrganizationTL()}
      token={GetTokenTL()}
      extensionType={props.extensionType}
    />,
  ];
  const renderTabContent = (tab: number) => {
    return tabs[tab];
  };

  return renderTabContent(activeTab);
};

export default ChooseInfo;
