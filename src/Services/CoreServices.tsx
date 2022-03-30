import * as Core from 'azure-devops-extension-api/Core';
import * as API from 'azure-devops-extension-api/';
import * as SDK from 'azure-devops-extension-sdk';
import { CommonServiceIds, IProjectPageService } from 'azure-devops-extension-api';

//Project page service has a method named getProject(), we can use for obtaining current project ID
export const getProjectPageService = async () => {
  return await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
};

//Core rest client for obtaining info about teams and members (project scope required)
export const coreRestClient = API.getClient(Core.CoreRestClient);

//All teams of every project
export const getAllTeams = async () => await coreRestClient.getAllTeams();

//Now you can filter those teams whose project ID matches the current project ID

//This should be done for every team in the project
export const getTeamMembers = async (projectId: string, teamId: string) =>
  coreRestClient.getTeamMembersWithExtendedProperties(projectId, teamId);
