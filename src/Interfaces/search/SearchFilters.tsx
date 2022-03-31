import { ObjectKey } from '../../interfaces';

export interface SearchFilters extends ObjectKey {
  offset?: number;
  page?: number;
  limit?: number;
  orderBy: string;
  orderAsc: boolean;
  filter?: any;
}

export const SearchBaseDefaults: SearchFilters = {
  offset: 0,
  page: 1,
  limit: 100,
  orderBy: 'date',
  orderAsc: false,
};
