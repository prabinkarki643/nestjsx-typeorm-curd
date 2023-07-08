import { QueryParams } from '../interface';

export const PARSED_CRUD_REQUEST_KEY = 'NESTJSX_PARSED_CRUD_REQUEST_KEY';
export const CURD_CONTROLLER_METADATA_KEY = 'CURD_CONTROLLER_METADATA_KEY';

export const defaultQueryParams: QueryParams = {
  fields: [],
  filter: [],
  or: [],
  join: [],
  sort: [],
  limit: 50,
  offset: 0,
  pagination: true,
  page: 1,
  cache: false,
  includeDeleted: false,
};
