import * as SDK from 'azure-devops-extension-sdk';
import { CommonServiceIds, IExtensionDataManager, IExtensionDataService } from 'azure-devops-extension-api';
//import { ErrorHandler } from '../../helpers';

export const ExtensionDataService = (async () => {
  return await SDK.getService<IExtensionDataService>(CommonServiceIds.ExtensionDataService);
})();

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

export const GetDocuments = async (collectionName: string) => {
  const extensionDataManager = await ExtensionDataManager();
  return new Promise<any[]>((resolve, reject) =>
    extensionDataManager
      .getDocuments(collectionName)
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
