export interface Query {
  table: string;
  queryKey?: string;
  queryValue?: string | number;
  limitPerPage?: number;
  skipPage?: number;
}
