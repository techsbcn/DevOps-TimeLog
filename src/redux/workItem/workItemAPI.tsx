import * as SDK from 'azure-devops-extension-sdk';
import * as API from 'azure-devops-extension-api';
import { IWorkItemFormService, WorkItemTrackingServiceIds } from 'azure-devops-extension-api/WorkItemTracking';
import * as WorkItemTracking from 'azure-devops-extension-api/WorkItemTracking';
import { GetWebApi } from '../apiSlice';
import * as nodeApi from 'azure-devops-node-api';
import { IWorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import * as WorkItemTrackingInterfaces from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import * as VSSInterfaces from 'azure-devops-node-api/interfaces/common/VSSInterfaces';
import { GetProjectTL, AuthHeader } from '../../helpers/RequestHeaders';
import { ErrorHandler, ResponseHandler } from '../../helpers/ResponseHandler';

export const WorkItemFormService = (async () => {
  return await SDK.getService<IWorkItemFormService>(WorkItemTrackingServiceIds.WorkItemFormService);
})();

export const WorkItemTrackingClient: WorkItemTracking.WorkItemTrackingRestClient = (() => {
  return API.getClient(WorkItemTracking.WorkItemTrackingRestClient, {});
})();

export const WorkItemNodeAPI = async (token?: string, orgUri?: string) => {
  const webApi: nodeApi.WebApi = await GetWebApi(token, orgUri);
  return new Promise<IWorkItemTrackingApi>((resolve, reject) =>
    webApi
      .getWorkItemTrackingApi()
      .then((result: IWorkItemTrackingApi) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      })
  );
};

export const GetWorkItemNodeAPI = async (workItemId: number, fields?: string[]) => {
  const witApi: IWorkItemTrackingApi = await WorkItemNodeAPI();
  return new Promise<WorkItemTrackingInterfaces.WorkItem>((resolve, reject) =>
    witApi
      .getWorkItem(workItemId, fields)
      .then((result: WorkItemTrackingInterfaces.WorkItem) => {
        resolve(result);
      })
      .catch((error) => {
        reject(ErrorHandler({ Id: 'GetWorkItemFieldsFailedException' }));
      })
  );
};

export const GetWorkItemId = async () => {
  const workItemFormService = await WorkItemFormService;
  return new Promise<number>((resolve, reject) =>
    workItemFormService
      .getId()
      .then((result: number) => {
        resolve(result);
      })
      .catch((error) => {
        reject(ErrorHandler(error));
      })
  );
};

export const GetFields = async (fieldReferenceNames: string[]) => {
  const workItemFormService = await WorkItemFormService;
  return new Promise<any>((resolve, reject) =>
    workItemFormService
      .getFieldValues(fieldReferenceNames, {
        returnOriginalValue: false,
      })
      .then((result: any) => {
        resolve(result);
      })
      .catch((error) => {
        reject(ErrorHandler(error));
      })
  );
};

export const SetFields = async (fields: any) => {
  const workItemFormService = await WorkItemFormService;
  return new Promise<boolean>((resolve, reject) =>
    workItemFormService
      .setFieldValues(fields)
      .then((result: { [fieldName: string]: boolean }) => {
        //Object.values(result).map((item) => !item && reject(ErrorHandler('FieldUpdateFailedException')));
        resolve(true);
      })
      .catch(() => {
        reject(ErrorHandler({ Id: 'FieldUpdateFailedException' }));
      })
  );
};

export const UpdateWorkItemNodeAPI = async (workItemId: number, fields?: VSSInterfaces.JsonPatchOperation[]) => {
  const witApi: IWorkItemTrackingApi = await WorkItemNodeAPI();
  const documents: any = fields;
  const patch: VSSInterfaces.JsonPatchOperation[] = [
    { op: VSSInterfaces.Operation.Replace, path: '/fields/Microsoft.VSTS.Scheduling.CompletedWork' },
  ];
  return new Promise<WorkItemTrackingInterfaces.WorkItem>((resolve, reject) =>
    witApi
      .updateWorkItem({}, documents, workItemId)
      .then((result: WorkItemTrackingInterfaces.WorkItem) => {
        resolve(result);
      })
      .catch((error) => {
        reject(ErrorHandler({ Id: 'FieldUpdateFailedException' }));
      })
  );
};

export const PatchWorkItem = async (fieldReferenceNames: string[], transformResult: (item: any) => any) => {
  return new Promise<boolean>((resolve, reject) =>
    GetFields(fieldReferenceNames).then((result: any) => {
      SetFields(transformResult(result))
        .then((complete: boolean) => {
          resolve(complete);
        })
        .catch(() => {
          reject(ErrorHandler({ Id: 'FieldUpdateFailedException' }));
        });
    })
  );
};

export const GetFieldsNodeAPI = async (project?: string) => {
  const projectStr = project ?? GetProjectTL();
  const witApi: IWorkItemTrackingApi = await WorkItemNodeAPI();
  return new Promise<any>((resolve, reject) =>
    witApi
      .getFields(projectStr)
      .then((result: any) => {
        resolve(result);
      })
      .catch((error) => {
        reject(ErrorHandler(error));
      })
  );
};

export const GetWorkItems = async (id?: string) => {
  const witApi: IWorkItemTrackingApi = await WorkItemNodeAPI();
  const searchId = id ? `AND [System.Id] = ${Number(id)}` : 'AND [System.ChangedDate] >= @today - 7';
  return new Promise<WorkItemTrackingInterfaces.WorkItem[]>((resolve, reject) =>
    witApi
      .queryByWiql(
        {
          query: `SELECT [System.Id] FROM workitems WHERE [System.TeamProject] = @project AND NOT [System.State] IN ('Completed', 'Closed', 'Cut', 'Resolved', 'Done') ${searchId}`,
        },
        { projectId: GetProjectTL() }
      )
      .then((result: WorkItemTrackingInterfaces.WorkItemQueryResult) => {
        result.workItems && result.workItems.length > 0
          ? witApi
              .getWorkItemsBatch({
                fields: [
                  'System.Id',
                  'System.Title',
                  'System.State',
                  'System.WorkItemType',
                  'System.AssignedTo',
                  'System.Tags',
                ],
                ids: result.workItems
                  .slice(0, 200)
                  .filter((x) => x.id !== undefined)
                  .map((x) => x.id ?? 0),
              })
              .then((result) => resolve(result))
              .catch(() => {
                reject(ErrorHandler({ Id: 'GetWorkItemsException' }));
              })
          : resolve([]);
      })
      .catch(() => {
        reject(ErrorHandler({ Id: 'GetWorkItemsException' }));
      })
  );
};

export const GetWorkItemById = async (ids: string[], token?: string) => {
  const witApi: IWorkItemTrackingApi = await WorkItemNodeAPI(token);
  const searchId = `AND [System.Id] in (${ids})`;
  return new Promise<WorkItemTrackingInterfaces.WorkItem[]>((resolve, reject) =>
    witApi
      .queryByWiql(
        {
          query: `SELECT [System.Id] FROM workitems WHERE [System.TeamProject] = @project AND NOT [System.State] IN ('Completed', 'Closed', 'Cut', 'Resolved', 'Done') ${searchId}`,
        },
        { projectId: GetProjectTL() }
      )
      .then((result: WorkItemTrackingInterfaces.WorkItemQueryResult) => {
        result.workItems && result.workItems.length > 0
          ? witApi
              .getWorkItemsBatch({
                fields: [
                  'System.Id',
                  'System.Title',
                  'System.State',
                  'System.WorkItemType',
                  'System.AssignedTo',
                  'System.Tags',
                ],
                ids: result.workItems
                  .slice(0, 200)
                  .filter((x) => x.id !== undefined)
                  .map((x) => x.id ?? 0),
              })
              .then((result) => resolve(result))
              .catch(() => {
                reject(ErrorHandler({ Id: 'GetWorkItemsException' }));
              })
          : resolve([]);
      })
      .catch(() => {
        reject(ErrorHandler({ Id: 'GetWorkItemsException' }));
      })
  );
};

export const GetTagsNodeAPI = async (project?: string, token?: string, organizationName?: string) => {
  const projectStr = project ?? GetProjectTL();
  const witApi: IWorkItemTrackingApi = await WorkItemNodeAPI(token, organizationName);
  return new Promise<WorkItemTrackingInterfaces.WorkItemTagDefinition[]>((resolve, reject) =>
    witApi
      .getTags(projectStr)
      .then((result: WorkItemTrackingInterfaces.WorkItemTagDefinition[]) => {
        resolve(result);
      })
      .catch((error) => {
        reject(ErrorHandler(error));
      })
  );
};

export const GetEpicsWorkItemsNode = async (organizationName?: string, projectId?: string, accessToken?: string) => {
  const requestOptions: RequestInit = {
    method: 'GET',
    headers: AuthHeader(accessToken),
  };

  return new Promise<any[]>((resolve, reject) =>
    fetch(
      `https://analytics.dev.azure.com/${organizationName}/${projectId}/_odata/v2.0//WorkItems?$select=WorkItemId,Title&$expand=Parent($select=WorkItemId,Title)&$filter=WorkItemType eq 'Epic'`,
      requestOptions
    )
      .then(ResponseHandler)
      .then((result: any) => {
        resolve(result.value);
      })
      .catch(() => {
        reject(ErrorHandler({ Id: 'GetWorkItemsException' }));
      })
  );
};

export const GetParentsWorkItemsNode = async (
  workItemsIds: number[],
  organizationName?: string,
  projectId?: string,
  accessToken?: string
) => {
  const requestOptions: RequestInit = {
    method: 'GET',
    headers: AuthHeader(accessToken),
  };

  return new Promise<any[]>((resolve, reject) =>
    fetch(
      `https://analytics.dev.azure.com/${organizationName}/${projectId}/_odata/v2.0//WorkItems?$select=WorkItemId,Title,TagNames&$expand=Parent($select=WorkItemId,Title)&$filter=WorkItemId in (${workItemsIds})`,
      requestOptions
    )
      .then(ResponseHandler)
      .then((result: any) => {
        resolve(result.value);
      })
      .catch(() => {
        reject(ErrorHandler({ Id: 'GetWorkItemsException' }));
      })
  );
};

export const GetParentRecursive = async (
  workItemId: number,
  organizationName?: string,
  projectId?: string,
  accessToken?: string
) => {
  let workItem: any;
  await GetParentsWorkItemsNode([workItemId], organizationName, projectId, accessToken)
    .then((result) => {
      workItem = result[0];
    })
    .catch((error) => {});

  if (workItem && workItem.Parent) {
    return GetParentRecursive(workItem.Parent.WorkItemId, organizationName, projectId, accessToken);
  }

  return workItem;
};
