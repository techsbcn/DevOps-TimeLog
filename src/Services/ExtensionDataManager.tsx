import * as SDK from 'azure-devops-extension-sdk';
import { CommonServiceIds, IExtensionDataManager, IExtensionDataService } from 'azure-devops-extension-api';

export const ExtensionDataService = (async () => {
  return await SDK.getService<IExtensionDataService>(CommonServiceIds.ExtensionDataService);
})();

export const ExtensionDataManager = async (accessToken: string): Promise<IExtensionDataManager> => {
  const extDataService = await ExtensionDataService;
  return await extDataService.getExtensionDataManager(SDK.getExtensionContext().id, accessToken);
};
