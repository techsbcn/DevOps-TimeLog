import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import * as nodeApi from 'azure-devops-node-api';

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

export const GetWebApi = async (token?: string, orgUri?: string) => {
  const tokenTL = token ?? localStorage.getItem('TL_TOKEN') ? JSON.parse(localStorage.getItem('TL_TOKEN') || '') : null;
  return new Promise<nodeApi.WebApi>((resolve, reject) => {
    const orgTL = orgUri ?? localStorage.getItem('TL_ORG') ? JSON.parse(localStorage.getItem('TL_ORG') || '') : null;
    if (orgTL) {
      try {
        const authHandler = nodeApi.getPersonalAccessTokenHandler(tokenTL);
        const vsts: nodeApi.WebApi = new nodeApi.WebApi(
          `https://dev.azure.com/${orgTL && orgTL.label ? orgTL.label : orgTL}`,
          authHandler
        );
        resolve(vsts);
      } catch (err) {
        reject(err);
      }
    } else {
      reject('OrganizationNotValid');
    }
  });
};
