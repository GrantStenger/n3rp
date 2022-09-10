export interface Query {
  table: string;
  queryKey?: string;
  queryValue?: string | number;
  limitPerPage?: number;
  skipPage?: number;
  queryFilterList?: (QueryFilter)[];
}

export interface Filter {
  filterKey: FilterTypes;
  default: boolean;
  active: boolean;
}


export enum FilterTypes {
  DATE_FILTER,
  COST_FILTER
}

export interface QueryFilter {
  filterType: QueryFilterTypes;
  filterKey: string;
  filterValue?: string|number|boolean|[];
}

export enum QueryFilterTypes {
  EQUAL_TO = "equalTo",
  NOT_EQUAL_TO = "notEqualTo",
  LESS_THAN = "lessThan",
  LESS_THAN_OR_EQUAL_TO = "lessThanOrEqualTo",
  GREATER_THAN = "greaterThan",
  GREATER_THAN_OR_EQUAL_TO = "greaterThanOrEqualTo",
  CONTAINED_IN = "containedIn",
  NOT_CONTAINED_IN = "notContainedIn",
  DISTINCT="distinct"
}