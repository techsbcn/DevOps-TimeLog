import * as SDK from 'azure-devops-extension-sdk';
import * as API from 'azure-devops-extension-api';
import { IWorkItemFormService, WorkItemTrackingServiceIds } from 'azure-devops-extension-api/WorkItemTracking';
import * as WorkItemTracking from 'azure-devops-extension-api/WorkItemTracking';
import { ErrorHandler } from '../../helpers';

export const WorkItemFormService = (async () => {
  return await SDK.getService<IWorkItemFormService>(WorkItemTrackingServiceIds.WorkItemFormService);
})();

export const WorkItemTrackingClient: WorkItemTracking.WorkItemTrackingRestClient = (() => {
  return API.getClient(WorkItemTracking.WorkItemTrackingRestClient, {});
})();

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
        Object.values(result).map((item) => !item && reject(ErrorHandler('FieldUpdateFailedException')));
        resolve(true);
      })
      .catch(() => {
        reject(ErrorHandler('FieldUpdateFailedException'));
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
          reject(ErrorHandler('FieldUpdateFailedException'));
        });
    })
  );
};
