import * as CoreSDK from 'azure-devops-extension-api/Core';
import * as API from 'azure-devops-extension-api/';
import * as SDK from 'azure-devops-extension-sdk';
import { CommonServiceIds, IProjectPageService } from 'azure-devops-extension-api';
import { TeamMember } from 'azure-devops-extension-api/WebApi';
import { Member } from '../../interfaces';
import * as nodeApi from 'azure-devops-node-api';
import { GetWebApi } from '../apiSlice';
import { ICoreApi } from 'azure-devops-node-api/CoreApi';
import * as CoreInterfaces from 'azure-devops-node-api/interfaces/CoreInterfaces';
import * as VSSInterfaces from 'azure-devops-node-api/interfaces/common/VSSInterfaces';
import { AuthHeader, GetProjectTL } from '../../helpers/RequestHeaders';
import { ErrorHandler, ResponseHandler } from '../../helpers/ResponseHandler';
import { ContextType } from '../../enums/ContextType';

export const GetProjectContext = async () => {
  return new Promise<API.IProjectInfo>((resolve, reject) =>
    SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService)
      .then((result: IProjectPageService) => {
        result
          .getProject()
          .then((project) => {
            project ? resolve(project) : reject(ErrorHandler({ Id: 'GetProjectContextException' }));
          })
          .catch(() => {
            reject(ErrorHandler({ Id: 'GetProjectContextException' }));
          });
      })
      .catch(() => {
        reject(ErrorHandler({ Id: 'GetProjectContextException' }));
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

export const GetAllTeamsSDK = async () => {
  return new Promise<CoreSDK.WebApiTeam[]>((resolve, reject) =>
    CoreSDKClient.getAllTeams()
      .then((result: CoreSDK.WebApiTeam[]) => {
        resolve(result);
      })
      .catch(() => {
        reject(ErrorHandler({ Id: 'GetTeamsException' }));
      })
  );
};

export const GetAllTeamsNodeAPI = async () => {
  const coreApiObject: ICoreApi = await CoreNodeAPI();
  return new Promise<CoreInterfaces.WebApiTeam[]>((resolve, reject) =>
    coreApiObject
      .getAllTeams()
      .then((result: CoreInterfaces.WebApiTeam[]) => {
        resolve(result);
      })
      .catch(() => {
        reject(ErrorHandler({ Id: 'GetTeamsException' }));
      })
  );
};

export const GetTeams = async (contextType: ContextType, projectId?: string) => {
  return contextType === ContextType.DEVOPS ? await GetTeamsSDK() : await GetTeamsAPI(projectId ?? GetProjectTL());
};

const GetTeamsSDK = async () => {
  const pId = (await GetProjectContext()).id;
  return new Promise<CoreSDK.WebApiTeam[]>((resolve, reject) =>
    CoreSDKClient.getTeams(pId)
      .then((result: CoreSDK.WebApiTeam[]) => {
        resolve(result);
      })
      .catch(() => {
        reject(ErrorHandler({ Id: 'GetTeamsException' }));
      })
  );
};

const GetTeamsAPI = async (projectId: string) => {
  const coreApiObject: ICoreApi = await CoreNodeAPI();
  return new Promise<CoreInterfaces.WebApiTeam[]>((resolve, reject) =>
    coreApiObject
      .getTeams(projectId)
      .then((result) => {
        resolve(result);
      })
      .catch(() => {
        reject(ErrorHandler({ Id: 'GetTeamsException' }));
      })
  );
};

export const GetTeamMembersSDK = async (teamId: string) => {
  const pId = (await GetProjectContext()).id;
  return new Promise<Member[]>((resolve, reject) =>
    CoreSDKClient.getTeamMembersWithExtendedProperties(pId, teamId)
      .then((result: TeamMember[]) => {
        let members: Member[] = [];
        members = result.map((item) => {
          const member: Member = { ...item.identity, isTeamAdmin: item.isTeamAdmin };
          return member;
        });
        resolve(members);
      })
      .catch(() => {
        reject(ErrorHandler({ Id: 'GetTeamsMembersException' }));
      })
  );
};
export const GetTeamMembers = async (teamId: string, contextType: ContextType, projectId?: string) => {
  return contextType === ContextType.DEVOPS
    ? await GetTeamMembersSDK(teamId)
    : await GetTeamMembersNodeAPI(teamId, projectId ?? GetProjectTL());
};

export const GetTeamMembersNodeAPI = async (teamId: string, projectId: string) => {
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
        reject(ErrorHandler({ Id: 'GetTeamsMembersException' }));
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
