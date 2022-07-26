import * as SDK from 'azure-devops-extension-sdk';
import { CommonServiceIds, IExtensionDataManager, IExtensionDataService } from 'azure-devops-extension-api';
import { GetWebApi } from '../apiSlice';
//import { ErrorHandler } from '../../helpers';
import * as nodeApi from 'azure-devops-node-api';
import * as ExtensionManagementApi from 'azure-devops-node-api/ExtensionManagementApi';
import { TimeLogEntry } from '../../interfaces';

export const ExtensionDataService = (async () => {
  return await SDK.getService<IExtensionDataService>(CommonServiceIds.ExtensionDataService);
})();

export const ExtensionDataManagerNodeAPI = async (token?: string, organizationName?: string) => {
  const webApi: nodeApi.WebApi = await GetWebApi(token, organizationName);
  return new Promise<ExtensionManagementApi.IExtensionManagementApi>((resolve, reject) =>
    webApi
      .getExtensionManagementApi()
      .then((result: ExtensionManagementApi.IExtensionManagementApi) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      })
  );
};

export const ExtensionDataManager = async () => {
  const accessToken = await SDK.getAccessToken();
  const extDataService = await ExtensionDataService;
  return new Promise<IExtensionDataManager>((resolve, reject) =>
    extDataService
      .getExtensionDataManager(SDK.getExtensionContext().id, accessToken)
      .then((result: IExtensionDataManager) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      })
  );
};

export const CheckInstalledExtension = async (token?: string) => {
  const extensionDataManager = await ExtensionDataManagerNodeAPI(token);
  return new Promise<boolean>((resolve, reject) =>
    extensionDataManager
      .getInstalledExtensionByName('TechsBCN', process.env.EXTENSION_ID as string)
      .then((response: any) => {
        resolve(response ? true : false);
      })
      .catch(() => {
        reject(false);
      })
  );
};

export const GetDocumentsAPI = async (collectionName: string, token?: string) => {
  const extensionDataManager = await ExtensionDataManagerNodeAPI(token);
  return new Promise<any[]>((resolve, reject) =>
    extensionDataManager
      .getDocumentsByName('TechsBCN', process.env.EXTENSION_ID as string, 'Default', 'Current', collectionName)
      .then((result: any) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      })
  );
};

export const GetDocuments = async (collectionName: string) => {
  const extensionDataManager = await ExtensionDataManager();
  return new Promise<any[]>((resolve, reject) =>
    extensionDataManager
      .getDocuments(collectionName)
      .then((result: any) => {
        resolve(result);
      })
      .catch((error) => {
        resolve([]);
      })
  );
};

export const CreateDocumentNodeAPi = async (
  collectionName: string,
  doc: any,
  token?: string,
  organizationName?: string
) => {
  const extensionDataManager = await ExtensionDataManagerNodeAPI(token, organizationName);
  return new Promise<any>((resolve, reject) =>
    extensionDataManager
      .createDocumentByName(doc, 'TechsBCN', process.env.EXTENSION_ID as string, 'Default', 'Current', collectionName)
      .then((result: any) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      })
  );
};

export const CreateDocument = async (collectionName: string, doc: any) => {
  const extensionDataManager = await ExtensionDataManager();
  return new Promise<any>((resolve, reject) =>
    extensionDataManager
      .createDocument(collectionName, doc)
      .then((result: any) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      })
  );
};

export const RemoveDocument = async (collectionName: string, id: string) => {
  const extensionDataManager = await ExtensionDataManager();
  return new Promise<void>((resolve, reject) =>
    extensionDataManager
      .deleteDocument(collectionName, id)
      .then((result: any) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      })
  );
};
export const SetDocument = async (collectionName: string, doc: any) => {
  const extensionDataManager = await ExtensionDataManager();
  return new Promise<any>((resolve, reject) =>
    extensionDataManager
      .setDocument(collectionName, doc)
      .then((result: any) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      })
  );
};

export const UpdateDocument = async (collectionName: string, doc: any) => {
  const extensionDataManager = await ExtensionDataManager();
  return new Promise<any>((resolve, reject) =>
    extensionDataManager
      .updateDocument(collectionName, doc)
      .then((result: any) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      })
  );
};
