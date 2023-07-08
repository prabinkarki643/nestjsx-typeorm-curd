import { FindAllResponseDto } from '../dto';

export interface CurdRequest {
  parsed: QueryParams;
  options?: any;
}

export interface QueryParams {
  fields: QueryFields;
  filter: QueryFilter[];
  or: QueryFilter[];
  join: QueryJoin[];
  sort: QuerySort[];
  pagination: boolean;
  limit: number;
  offset: number;
  page: number;
  cache: boolean;
  includeDeleted: boolean;
}

export declare type QuerySort = {
  field: string;
  order: QuerySortOperator;
};

export type QueryJoin = {
  field: string;
  select?: QueryFields;
};

export type QueryFields = string[];

export type QueryFilter = {
  field: string;
  operator: QueryCondOperator;
  value?: any;
};

export type QuerySortOperator = 'ASC' | 'DESC';

export enum QueryCondOperator {
  EQUALS = '$eq',
  NOT_EQUALS = '$ne',
  GREATER_THAN = '$gt',
  LOWER_THAN = '$lt',
  GREATER_THAN_EQUALS = '$gte',
  LOWER_THAN_EQUALS = '$lte',
  STARTS = '$starts',
  ENDS = '$ends',
  CONTAINS = '$cont',
  EXCLUDES = '$excl',
  IN = '$in',
  NOT_IN = '$notin',
  IS_NULL = '$isnull',
  NOT_NULL = '$notnull',
  BETWEEN = '$between',
  EQUALS_LOW = '$eqL',
  NOT_EQUALS_LOW = '$neL',
  STARTS_LOW = '$startsL',
  ENDS_LOW = '$endsL',
  CONTAINS_LOW = '$contL',
  EXCLUDES_LOW = '$exclL',
  IN_LOW = '$inL',
  NOT_IN_LOW = '$notinL',
}

export interface TypeOrmCurdControllerI<T> {
  factoryOptions: TypeOrmCurdFactoryOptions;

  findAll(req: CurdRequest): Promise<FindAllResponseDto<T>>;
  count(req: CurdRequest): Promise<number>;

  findById(id: string, req: CurdRequest): Promise<T>;

  create(dto: string, req: CurdRequest): Promise<T>;

  update(id: string, dto: string, req: CurdRequest): Promise<T>;

  delete(id: string): Promise<T[]>;
}

export interface BaseRouteOptions {
  interceptors?: any[];
  decorators?: (PropertyDecorator | MethodDecorator)[];
  dto?: any;
}
export interface ModelOptions {
  type: any;
}

export interface TypeOrmCurdFactoryOptions {
  modal: ModelOptions;
  routes?: {
    findAll?: Omit<BaseRouteOptions, 'dto'>;
    count?: Omit<BaseRouteOptions, 'dto'>;
    findById?: Omit<BaseRouteOptions, 'dto'>;
    create?: BaseRouteOptions;
    update?: BaseRouteOptions;
    delete?: Omit<BaseRouteOptions, 'dto'>;
  };
  query?: Partial<QueryParams>;
}
