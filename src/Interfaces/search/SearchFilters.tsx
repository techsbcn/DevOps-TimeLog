import { ObjectKey } from '../../interfaces';

export interface SearchFilters extends ObjectKey {
  offset?: number;
  page?: number;
  limit?: number;
  search?: string;
  orderBy: string;
  orderAsc: boolean;
}
