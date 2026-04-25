export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface TableParams {
  page: number;
  limit: number;
  query?: string;
  category_id?: string;
}
