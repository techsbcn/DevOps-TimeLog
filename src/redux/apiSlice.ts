import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import * as vm from 'azure-devops-node-api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['extensionData'],
  endpoints: () => ({}),
});

export const GetWebApi = async (token: string, orgUri: string) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<vm.WebApi>(async (resolve, reject) => {
    try {
      const authHandler = vm.getPersonalAccessTokenHandler(token);
      const vsts: vm.WebApi = new vm.WebApi(orgUri, authHandler);

      resolve(vsts);
    } catch (err) {
      reject(err);
    }
  });
};
