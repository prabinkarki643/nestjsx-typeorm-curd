import { BadRequestException, NotFoundException } from '@nestjs/common';
import { isNil, uniqWith } from 'lodash';
import {
  DataSourceOptions,
  DeepPartial,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import {
  CurdRequest,
  QueryCondOperator,
  QueryFields,
  QueryFilter,
  QueryJoin,
} from './interface';

export class TypeOrmCurdService<T> {
  private dbName: DataSourceOptions['type'];

  private entityColumns: string[];

  private entityRelationalColumns: string[];

  private entityPrimaryColumns: string[];

  private entityHasDeleteColumn = false;

  private entityColumnsHash: ObjectLiteral = {};

  private tableAlias = 'tabel';

  private sqlInjectionRegEx: RegExp[] = [
    /(%27)|(\')|(--)|(%23)|(#)/gi,
    /((%3D)|(=))[^\n]*((%27)|(\')|(--)|(%3B)|(;))/gi,
    /w*((%27)|(\'))((%6F)|o|(%4F))((%72)|r|(%52))/gi,
    /((%27)|(\'))union/gi,
  ];

  constructor(private readonly repository: Repository<T>) {
    this.dbName = this.repository.metadata.connection.options.type;
    this.onInitMapEntityColumns();
  }

  /**
   * Eg:
   * http://localhost:8000/api/test?join[0][field]=avatar&join[1][field]=role&filter[0][field]=userName&filter[0][operator]=$eq&filter[0][value]=prabinkarki643&or[0][field]=userName&or[0][operator]=$eq&or[0][value]=test1user
   */
  async find(req: CurdRequest) {
    const { limit, page, offset, pagination } = req.parsed;
    const builder = await this.createBuilder(req);
    const [results, total] = await builder.getManyAndCount();

    var paginationInfo = {
      page: 0,
      pageSize: 0,
      pageCount: 0,
      total: 0,
      offset: 0,
      pagination,
    };
    if (pagination) {
      const pageCount = Math.ceil(total / limit);
      paginationInfo = {
        ...paginationInfo,
        page: page,
        pageSize: limit,
        pageCount,
        total,
        offset,
      };
    }
    return {
      data: results,
      ...paginationInfo,
    };
  }

  async findById(id: string, req: CurdRequest) {
    const builder = await this.createBuilder(req);
    const { str, params } = this.mapOperatorsToQuery(
      { field: 'id', operator: QueryCondOperator.EQUALS, value: id },
      'andWhereId',
    );
    builder.where(str, params);
    const res = await builder.getOne();
    return res;
  }

  async findByIdOrFail(id: string, req: CurdRequest) {
    const found = await this.findById(id, req);
    if (!found) {
      return new NotFoundException('Entry not found');
    }
    return found;
  }

  async create(doc: DeepPartial<T & any>, req: CurdRequest): Promise<T> {
    const entry = await this.repository.save(doc);

    return this.findById(entry.id, req);
  }

  async update(id: string, doc: DeepPartial<T & any>, req: CurdRequest) {
    await this.repository.update(id, doc);
    return this.findById(id, req);
  }

  async count(req: CurdRequest) {
    const builder = await this.createBuilder(req);
    return builder.getCount();
  }

  async delete(ids: string[]) {
    const builder = await this.createBuilder();
    const { str, params } = this.mapOperatorsToQuery(
      { field: 'id', operator: QueryCondOperator.IN, value: ids },
      'andWhereId',
    );
    builder.andWhere(str, params);
    const entries = await builder.getMany();
    return this.repository.remove(entries);
  }

  async createBuilder(req?: CurdRequest) {
    const {
      fields,
      filter,
      sort,
      limit,
      offset,
      pagination,
      page,
      or,
      join,
      cache,
      includeDeleted,
    } = req.parsed;
    const builder = this.repository.createQueryBuilder(this.tableAlias);

    //handle select
    const select = this.getSelect(fields).map(
      (f) => `${this.getFieldWithAlias(f)}`,
    );
    builder.select(select);

    //handle joins
    const relations = this.getJoin(join);
    relations.forEach((rel) => {
      builder.leftJoinAndSelect(
        `${this.getFieldWithAlias(rel.field)}`,
        rel.field,
      );
    });

    //handle AND filter
    filter.forEach((f, i) => {
      const { str, params } = this.mapOperatorsToQuery(
        f,
        `andWhere${f.field}${i}`,
      );
      builder.andWhere(str, params);
    });

    //handle OR filter
    or.forEach((f, i) => {
      const { str, params } = this.mapOperatorsToQuery(
        f,
        `orWhere${f.field}${i}`,
      );
      builder.orWhere(str, params);
    });

    // if soft deleted is enabled add where statement to filter deleted records
    if (this.entityHasDeleteColumn && includeDeleted) {
      builder.withDeleted();
    }

    // set sort (order by)
    var sortObj = {};
    sort.forEach((sor) => {
      const checkedFiled = this.checkSqlInjection(sor.field);
      sortObj[`${this.getFieldWithAlias(checkedFiled)}`] = sor.order;
    });
    builder.orderBy(sortObj);

    if (pagination) {
      // handle limit
      const take = limit;
      /* istanbul ignore else */
      if (isFinite(take)) {
        builder.take(take);
      }

      // handle offset
      var skip: number = offset;
      if (page && isFinite(page)) {
        skip = (page - 1) * limit;
      }
      if (isFinite(skip)) {
        builder.skip(skip);
      }
    }

    //handle cache
    if (cache) {
      builder.cache(true);
    }

    return builder;
  }

  private getSelect(queryFields: QueryFields) {
    const allowed = this.entityColumns;
    const columns =
      queryFields && queryFields.length
        ? queryFields.filter((field) => allowed.some((col) => field === col))
        : allowed;
    const select = new Set([...columns, ...this.entityPrimaryColumns]);
    return Array.from(select);
  }

  private getJoin(queryJoins: QueryJoin[]) {
    const isAll = queryJoins.find((f) => f.field === '*');
    if (isAll) {
      queryJoins = [
        ...queryJoins.filter((f) => f.field !== '*'),
        ...this.entityRelationalColumns.map((m) => ({ field: m })),
      ];
    }
    return uniqWith(queryJoins, (a, b) => a.field === b.field);
  }

  private onInitMapEntityColumns() {
    this.entityColumns = this.repository.metadata.columns.map((prop) => {
      // In case column is an embedded, use the propertyPath to get complete path
      if (prop.embeddedMetadata) {
        this.entityColumnsHash[prop.propertyPath] = prop.databasePath;
        return prop.propertyPath;
      }
      this.entityColumnsHash[prop.propertyName] = prop.databasePath;
      return prop.propertyName;
    });

    this.entityRelationalColumns = this.repository.metadata.columns
      .filter((p) => Boolean(p.relationMetadata))
      .map((m) => m.relationMetadata.propertyName);

    this.entityPrimaryColumns = this.repository.metadata.columns
      .filter((prop) => prop.isPrimary)
      .map((prop) => prop.propertyName);
    this.entityHasDeleteColumn =
      this.repository.metadata.columns.filter((prop) => prop.isDeleteDate)
        .length > 0;
  }

  /**
   * https://github.com/nestjsx/crud/wiki/Requests#filter-conditions
   * @param cond QueryFilter
   * @param tableAlias  tableAlias
   * @param param unique string for assigning param value for query builder
   */
  private mapOperatorsToQuery(
    cond: QueryFilter,
    param: string, //Each param must be unique in query builder
  ): { str: string; params: ObjectLiteral } {
    const field = `${this.getFieldWithAlias(cond.field)}`;
    const likeOperator =
      this.dbName === 'postgres' ? 'ILIKE' : /* istanbul ignore next */ 'LIKE';
    let str: string;
    let params: ObjectLiteral;

    switch (cond.operator) {
      case '$eq':
        str = `${field} = :${param}`;
        break;

      case '$ne':
        str = `${field} != :${param}`;
        break;

      case '$gt':
        str = `${field} > :${param}`;
        break;

      case '$lt':
        str = `${field} < :${param}`;
        break;

      case '$gte':
        str = `${field} >= :${param}`;
        break;

      case '$lte':
        str = `${field} <= :${param}`;
        break;

      case '$starts':
        str = `${field} LIKE :${param}`;
        params = { [param]: `${cond.value}%` };
        break;

      case '$ends':
        str = `${field} LIKE :${param}`;
        params = { [param]: `%${cond.value}` };
        break;

      case '$cont':
        str = `${field} LIKE :${param}`;
        params = { [param]: `%${cond.value}%` };
        break;

      case '$excl':
        str = `${field} NOT LIKE :${param}`;
        params = { [param]: `%${cond.value}%` };
        break;

      case '$in':
        this.checkFilterIsArray(cond);
        str = `${field} IN (:...${param})`;
        break;

      case '$notin':
        this.checkFilterIsArray(cond);
        str = `${field} NOT IN (:...${param})`;
        break;

      case '$isnull':
        str = `${field} IS NULL`;
        params = {};
        break;

      case '$notnull':
        str = `${field} IS NOT NULL`;
        params = {};
        break;

      case '$between':
        this.checkFilterIsArray(cond, cond.value.length !== 2);
        str = `${field} BETWEEN :${param}0 AND :${param}1`;
        params = {
          [`${param}0`]: cond.value[0],
          [`${param}1`]: cond.value[1],
        };
        break;

      // case insensitive
      case '$eqL':
        str = `LOWER(${field}) = :${param}`;
        break;

      case '$neL':
        str = `LOWER(${field}) != :${param}`;
        break;

      case '$startsL':
        str = `LOWER(${field}) ${likeOperator} :${param}`;
        params = { [param]: `${cond.value}%` };
        break;

      case '$endsL':
        str = `LOWER(${field}) ${likeOperator} :${param}`;
        params = { [param]: `%${cond.value}` };
        break;

      case '$contL':
        str = `LOWER(${field}) ${likeOperator} :${param}`;
        params = { [param]: `%${cond.value}%` };
        break;

      case '$exclL':
        str = `LOWER(${field}) NOT ${likeOperator} :${param}`;
        params = { [param]: `%${cond.value}%` };
        break;

      case '$inL':
        this.checkFilterIsArray(cond);
        str = `LOWER(${field}) IN (:...${param})`;
        break;

      case '$notinL':
        this.checkFilterIsArray(cond);
        str = `LOWER(${field}) NOT IN (:...${param})`;
        break;

      /* istanbul ignore next */
      default:
        str = `${field} = :${param}`;
        break;
    }

    if (typeof params === 'undefined') {
      params = { [param]: cond.value };
    }

    return { str, params };
  }

  private checkFilterIsArray(cond: QueryFilter, withLength?: boolean) {
    /* istanbul ignore if */
    if (
      !Array.isArray(cond.value) ||
      !cond.value.length ||
      (!isNil(withLength) ? withLength : false)
    ) {
      throw new BadRequestException(`Invalid column '${cond.field}' value`);
    }
  }

  private getFieldWithAlias(field: string) {
    return `${this.tableAlias}.${field}`;
  }

  private checkSqlInjection(field: string): string {
    /* istanbul ignore else */
    if (this.sqlInjectionRegEx.length) {
      for (let i = 0; i < this.sqlInjectionRegEx.length; i++) {
        /* istanbul ignore else */
        if (this.sqlInjectionRegEx[0].test(field)) {
          throw new BadRequestException(`SQL injection detected: "${field}"`);
        }
      }
    }

    return field;
  }
}
