import * as SDK from "azure-devops-extension-sdk";
import * as API from "azure-devops-extension-api";
import {IWorkItemFormService, WorkItemTrackingServiceIds} from "azure-devops-extension-api/WorkItemTracking";
import * as WorkItemTracking from "azure-devops-extension-api/WorkItemTracking";

export const WorkItemFormService = (async () => {return await SDK.getService<IWorkItemFormService>(
    WorkItemTrackingServiceIds.WorkItemFormService)})()

export const WorkItemTrackingClient : WorkItemTracking.WorkItemTrackingRestClient = (() => {
    const witRestClient = WorkItemTracking.WorkItemTrackingRestClient
    return API.getClient(witRestClient, {})
})()