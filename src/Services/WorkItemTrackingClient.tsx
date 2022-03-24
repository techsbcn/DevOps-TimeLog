import * as API from "azure-devops-extension-api";
import * as WorkItemTracking from "azure-devops-extension-api/WorkItemTracking";

export const WorkItemTrackingClient : WorkItemTracking.WorkItemTrackingRestClient = (() => {
    const witRestClient = WorkItemTracking.WorkItemTrackingRestClient
    return API.getClient(witRestClient, {})
})()