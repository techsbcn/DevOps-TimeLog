import * as SDK from "azure-devops-extension-sdk";
import { ExtensionDataManager } from "./ExtensionDataManager";

export const getAllEntries = async ()  => {
    try {
        const accessToken = await SDK.getAccessToken()
        const extensionDataManager = await ExtensionDataManager(accessToken)
        return await extensionDataManager.getDocuments("TimeLogData") as [TimeLogEntry]
    } catch (error) {
        //TODO Handle error here
    }
}

export const addEntry = async (timelogEntry : TimeLogEntry) => {
    try {
        const accessToken = await SDK.getAccessToken()
        const extensionDataManager = await ExtensionDataManager(accessToken)
        extensionDataManager.createDocument("TimeLogData", timelogEntry)
    } catch (error) {
        //TODO Handle error here
    }
}

export const deleteEntry = async (timelogEntryId : string) => {
    try {
        const accessToken = await SDK.getAccessToken()
        const extensionDataManager = await ExtensionDataManager(accessToken)
        extensionDataManager.deleteDocument("TimeLogData", timelogEntryId)
    } catch (error) {
        //TODO Handle error here
    }
}

export const updateEntry = async (timelogEntry : TimeLogEntry) => {
    try {
        const accessToken = await SDK.getAccessToken()
        const extensionDataManager = await ExtensionDataManager(accessToken)
        extensionDataManager.setDocument("TimeLogData", timelogEntry)
    } catch (error) {
        //TODO Handle error here
    }
}