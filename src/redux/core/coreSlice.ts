import * as API from 'azure-devops-extension-api/';
import * as Core from 'azure-devops-extension-api/Core';
import { apiSlice } from '../apiSlice';

export const coreRestClient = API.getClient(Core.CoreRestClient);

const coreEndpoints = apiSlice.injectEndpoints({
  endpoints(builder) {
    return {
      fetchGetTeams: builder.query<Core.WebApiTeam[], void>({
        keepUnusedDataFor: 0,
        queryFn: async () => {
          return { data: await coreRestClient.getAllTeams() };
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

export const { useFetchGetTeamsQuery } = coreEndpoints;
