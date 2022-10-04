import { ListResultCollection } from './../../Interfaces/search/ListResultCollection';
import { SearchFilters } from './../../Interfaces/search/SearchFilters';
//import { ErrorHandler } from '../../helpers';
import { apiSlice } from '../apiSlice';
import {
  GetDocuments,
  CreateDocument,
  RemoveDocument,
  UpdateDocument,
  SetDocument,
  GetDocumentsAPI,
} from './extensionDataManagerAPI';
import * as _ from 'lodash';
import { reject } from 'lodash';
import { GetParentsWorkItemsNode } from '../workItem/workItemAPI';

const extensionDataEndpoints = apiSlice.injectEndpoints({
  endpoints(builder) {
    return {
      fetchGetDocuments: builder.query<
        ListResultCollection<any>,
        { collectionName: string; filters: SearchFilters; useAPIExtension?: boolean }
      >({
        keepUnusedDataFor: 60,
        queryFn: async (request) => {
          let documents = request.useAPIExtension
            ? await GetDocumentsAPI(request.collectionName)
            : await GetDocuments(request.collectionName);
          if (request.filters.filter) documents = _.filter(documents, request.filters.filter);
          const totalCount = documents.length;
          if (request.filters.limit && request.filters.page) {
            const startIndex = request.filters.page * request.filters.limit - request.filters.limit;
            const endIndex = startIndex + request.filters.limit;
            documents = _.slice(documents, startIndex, endIndex);
          }
          return {
            data: {
              items: _.orderBy(documents, request.filters.orderBy, request.filters.orderAsc ? 'asc' : 'desc'),
              totalCount: totalCount,
            },
          };
        },
        async onQueryStarted(_request, { queryFulfilled }) {
          await queryFulfilled.catch((err) => {
            reject(err);
          });
        },
        providesTags: (result, _error, { collectionName }) =>
          result
            ? [
                ...result.items.map(({ id }) => ({ type: 'extensionData' as const, id, collectionName })),
                { type: 'extensionData', id: 'LIST', collectionName },
              ]
            : [{ type: 'extensionData', id: 'LIST' }],
      }),
      fetchGetDocumentsWithoutFilters: builder.query<
        ListResultCollection<any>,
        { collectionName: string; useAPIExtension?: boolean }
      >({
        keepUnusedDataFor: 60,
        queryFn: async (request) => {
          const documents = request.useAPIExtension
            ? await GetDocumentsAPI(request.collectionName)
            : await GetDocuments(request.collectionName);
          const totalCount = documents.length;
          return {
            data: {
              items: documents,
              totalCount: totalCount,
            },
          };
        },
        async onQueryStarted(_request, { queryFulfilled }) {
          await queryFulfilled.catch((err) => {
            console.log(err);
          });
        },
        providesTags: (result, _error, { collectionName }) =>
          result
            ? [
                ...result.items.map(({ id }) => ({ type: 'extensionData' as const, id, collectionName })),
                { type: 'extensionData', id: 'LIST', collectionName },
              ]
            : [{ type: 'extensionData', id: 'LIST', collectionName }],
      }),
      fetchCreateDocument: builder.mutation<any, { collectionName: string; doc: any }>({
        queryFn: async (request) => {
          return { data: await CreateDocument(request.collectionName, request.doc) };
        },
        async onQueryStarted(_request, { queryFulfilled }) {
          await queryFulfilled.catch((err) => {
            console.log(err);
          });
        },
        invalidatesTags: (_result, _error, { collectionName }) => [
          { type: 'extensionData', id: 'LIST', collectionName },
        ],
      }),
      fetchRemoveDocument: builder.mutation<void, { collectionName: string; id: string }>({
        queryFn: async (request) => {
          return { data: await RemoveDocument(request.collectionName, request.id) };
        },
        async onQueryStarted(_request, { queryFulfilled }) {
          await queryFulfilled.catch((err) => {
            console.log(err);
          });
        },
        invalidatesTags: (_result, _error, { id, collectionName }) => [{ type: 'extensionData', id, collectionName }],
      }),
      fetchUpdateDocument: builder.mutation<any, { collectionName: string; doc: any }>({
        queryFn: async (request) => {
          return { data: await UpdateDocument(request.collectionName, request.doc) };
        },
        async onQueryStarted(_request, { queryFulfilled }) {
          await queryFulfilled.catch((err) => {
            console.log(err);
          });
        },
        invalidatesTags: (_result, _error, { doc, collectionName }) => [
          { type: 'extensionData', id: doc.id, collectionName },
        ],
      }),
      fetchSetDocument: builder.mutation<any, { collectionName: string; doc: any }>({
        queryFn: async (request) => {
          return { data: await SetDocument(request.collectionName, request.doc) };
        },
        async onQueryStarted(_request, { queryFulfilled }) {
          await queryFulfilled.catch((err) => {
            console.log(err);
          });
        },
        invalidatesTags: (_result, _error, { doc, collectionName }) => [
          { type: 'extensionData', id: doc.id, collectionName },
        ],
      }),
    };
  },
});

export const {
  useFetchGetDocumentsQuery,
  useFetchCreateDocumentMutation,
  useFetchRemoveDocumentMutation,
  useFetchSetDocumentMutation,
  useFetchUpdateDocumentMutation,
  useFetchGetDocumentsWithoutFiltersQuery,
} = extensionDataEndpoints;
