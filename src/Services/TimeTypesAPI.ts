import * as SDK from "azure-devops-extension-sdk";
import { TimeType } from "../Interfaces/TimeType";
import { ExtensionDataManager } from "./ExtensionDataManager";


export const getAllTimeTypes = async ()  => {
    try {
        const accessToken = await SDK.getAccessToken()
        const extensionDataManager = await ExtensionDataManager(accessToken)
        return await extensionDataManager.getDocuments("TimeTypes") as [TimeType]
    } catch (error) {
        //TODO Handle error here
    }
}

export const addTimeType = async (timeType : TimeType) => {
    try {
        const accessToken = await SDK.getAccessToken()
        const extensionDataManager = await ExtensionDataManager(accessToken)
        extensionDataManager.createDocument("TimeTypes", timeType)
    } catch (error) {
        //TODO Handle error here
    }
}

export const deleteTimeType = async (timeTypeId : string) => {
    try {
        const accessToken = await SDK.getAccessToken()
        const extensionDataManager = await ExtensionDataManager(accessToken)
        extensionDataManager.deleteDocument("TimeTypes", timeTypeId)
    } catch (error) {
        //TODO Handle error here
    }
}

export const updateTimeType = async (timeType : TimeType) => {
    try {
        const accessToken = await SDK.getAccessToken()
        const extensionDataManager = await ExtensionDataManager(accessToken)
        extensionDataManager.setDocument("TimeTypes", timeType)
    } catch (error) {
        //TODO Handle error here
    }
}