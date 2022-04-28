import * as CoreSDK from 'azure-devops-extension-api/Core';
import * as API from 'azure-devops-extension-api/';
import * as SDK from 'azure-devops-extension-sdk';
import { CommonServiceIds, IProjectPageService } from 'azure-devops-extension-api';
import { AuthHeader, ErrorHandler, ResponseHandler } from '../../helpers';
import { GetWebApi } from '../apiSlice';
import { Member } from '../../interfaces';
import * as nodeApi from 'azure-devops-node-api';
import { ICoreApi } from 'azure-devops-node-api/CoreApi';
import * as CoreInterfaces from 'azure-devops-node-api/interfaces/CoreInterfaces';
import * as VSSInterfaces from 'azure-devops-node-api/interfaces/common/VSSInterfaces';

export const GetProjectContext = async () => {
  return new Promise<API.IProjectInfo>((resolve, reject) =>
    SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService)
      .then((result: IProjectPageService) => {
        result
          .getProject()
          .then((project) => {
            project ? resolve(project) : reject(ErrorHandler('GetProjectContextException'));
          })
          .catch(() => {
            reject(ErrorHandler('GetProjectContextException'));
          });
      })
      .catch(() => {
        reject(ErrorHandler('GetProjectContextException'));
      })
  );
};

export const CoreSDKClient = API.getClient(CoreSDK.CoreRestClient);

export const CoreNodeAPI = async (token?: string) => {
  const webApi: nodeApi.WebApi = await GetWebApi(token);
  return new Promise<ICoreApi>((resolve, reject) =>
    webApi
      .getCoreApi()
      .then((result: ICoreApi) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      })
  );
};

export const GetAllTeams = async () => {
  const coreApiObject: ICoreApi = await CoreNodeAPI();
  return new Promise<CoreInterfaces.WebApiTeam[]>((resolve, reject) =>
    coreApiObject
      .getAllTeams()
      .then((result: CoreInterfaces.WebApiTeam[]) => {
        resolve(result);
      })
      .catch(() => {
        reject(ErrorHandler('GetTeamsException'));
      })
  );
};

export const GetTeams = async (projectId: string) => {
  const coreApiObject: ICoreApi = await CoreNodeAPI();
  return new Promise<CoreInterfaces.WebApiTeam[]>((resolve, reject) =>
    coreApiObject
      .getTeams(projectId)
      .then((result) => {
        resolve(result);
      })
      .catch(() => {
        reject(ErrorHandler('GetTeamsException'));
      })
  );
};

export const GetTeamMembers = async (teamId: string, projectId: string) => {
  const coreApiObject: ICoreApi = await CoreNodeAPI();
  return new Promise<Member[]>((resolve, reject) =>
    coreApiObject
      .getTeamMembersWithExtendedProperties(projectId, teamId)
      .then((result: VSSInterfaces.TeamMember[]) => {
        let members: Member[] = [];
        members = result.map((item) => {
          const member: Member = { ...item.identity, isTeamAdmin: item.isTeamAdmin };
          return member;
        });
        resolve(members);
      })
      .catch(() => {
        reject(ErrorHandler('GetTeamsMembersException'));
      })
  );
};

export const GetOrganizations = async (memberId: string, accessToken?: string) => {
  const requestOptions: RequestInit = {
    method: 'GET',
    headers: AuthHeader(accessToken),
  };

  return new Promise<any[]>((resolve, reject) =>
    fetch(`https://app.vssps.visualstudio.com/_apis/accounts?memberId=${memberId}&api-version=6.0`, requestOptions)
      .then(ResponseHandler)
      .then((result: any) => {
        resolve(result.value);
      })
      .catch((error) => {
        reject(error);
      })
  );
};

export const GetProjects = async (organization: string, accessToken?: string) => {
  const requestOptions: RequestInit = {
    method: 'GET',
    headers: AuthHeader(accessToken),
  };

  return new Promise<any[]>((resolve, reject) =>
    fetch(`https://dev.azure.com/${organization}/_apis/projects?api-version=6.0`, requestOptions)
      .then(ResponseHandler)
      .then((result: any) => {
        resolve(result.value);
      })
      .catch((error) => {
        reject(error);
      })
  );
};
