import * as SDK from "azure-devops-extension-sdk";
import {IWorkItemFormService, WorkItemTrackingServiceIds} from "azure-devops-extension-api/WorkItemTracking";

export const WorkItemFormService = (async () => {return await SDK.getService<IWorkItemFormService>(
    WorkItemTrackingServiceIds.WorkItemFormService)})()