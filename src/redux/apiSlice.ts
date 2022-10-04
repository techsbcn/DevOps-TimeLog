import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import * as nodeApi from 'azure-devops-node-api';

const BHeader = () => {
  return { 'Content-Type': 'application/json' };
};

const Header = (token?: string) => {
  const tokenTL = token
    ? JSON.parse(JSON.stringify(token))
    : localStorage.getItem('TL_TOKEN')
    ? JSON.parse(localStorage.getItem('TL_TOKEN') || '')
    : null;
  if (tokenTL) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenTL}`,
      'Access-Control-Allow-Origin': '*',
    };
  } else {
    return BHeader();
  }
};

const Response = (response: any) => {
  if (response.status === 203) return Promise.reject({ Id: 'NotAuthorizedException', Code: response.status });
  else {
    return response.text().then((text: any) => {
      const data = text && JSON.parse(text);
      if (!response.ok || response.status === 203) return Promise.reject(data);

      return data;
    });
  }
};

const GetWorkItemsNode = async (
  workItemsIds: number[],
  organizationName?: string,
  projectId?: string,
  accessToken?: string
) => {
  const requestOptions: RequestInit = {
    method: 'GET',
    headers: Header(accessToken),
  };

  return new Promise<any[]>((resolve, reject) =>
    fetch(
      `https://analytics.dev.azure.com/${organizationName}/${projectId}/_odata/v2.0//WorkItems?$select=WorkItemId,Title,TagNames&$expand=Parent($select=WorkItemId,Title)&$filter=WorkItemId in (${workItemsIds})`,
      requestOptions
    )
      .then(Response)
      .then((result: any) => {
        resolve(result.value);
      })
      .catch(() => {
        resolve([]);
      })
  );
};

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
  endpoints: (builder) => {
    return {
      fetchGetWorkItem: builder.query<
        any,
        { workItem: number; organizationName?: string; projectId?: string; token?: string }
      >({
        queryFn: async (request) => {
          const workItems = await GetWorkItemsNode(
            [request.workItem],
            request.organizationName,
            request.projectId,
            request.token
          );
          return {
            data: request.workItem ? workItems : [],
          };
        },
        async onQueryStarted(_request, { queryFulfilled }) {
          await queryFulfilled.catch((err) => {
            console.log(err);
          });
        },
      }),
    };
  },
});

export const GetWebApi = async (token?: string, orgUri?: string) => {
  const tokenTL = token
    ? JSON.parse(JSON.stringify(token))
    : localStorage.getItem('TL_TOKEN')
    ? JSON.parse(localStorage.getItem('TL_TOKEN') || '')
    : null;
  return new Promise<nodeApi.WebApi>((resolve, reject) => {
    const orgTL = orgUri
      ? JSON.parse(JSON.stringify(orgUri))
      : localStorage.getItem('TL_ORG')
      ? JSON.parse(localStorage.getItem('TL_ORG') || '')
      : null;
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
      reject({ Id: 'OrganizationNotValid' });
    }
  });
};
