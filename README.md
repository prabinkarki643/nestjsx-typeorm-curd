# Typeorm Curd Generator

This code represent how to use Typeorm Curd Generator

## Installation

```sh
npm i @prabink/nestjsx-typeorm-curd
```

Also install the following to work with this packages if not installed

```sh
npm i @nestjs/typeorm typeorm @nestjs/swagger
```

## Usage/Examples

### Service Using (TypeOrmCurdService<T>)

```javascript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCurdService } from '@Pathto_typeorm-curd/typeorm-curd.service';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService extends TypeOrmCurdService<User> {
  constructor(
    @InjectRepository(User)
    public readonly usersRepository: Repository<User>,
  ) {
    super(usersRepository);
  }
}
```

### Controller Using (TypeOrmCurdControllerFactory<T>(options?: TypeOrmCurdFactoryOptions))

```javascript
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TypeOrmCurdControllerFactory } from 'src/shared/classes/typeorm-curd/typeorm-curd.factory';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';

@ApiTags('User Controller')
@Controller('users')
export class UserController extends TypeOrmCurdControllerFactory<User>({
  modal: {
    type: User,
  },
  routes: {
    findAll: {
      decorators: [],
    },
    create: {
      dto: CreateUserDto,
    },
    update: {
      dto: UpdateUserDto,
    },
  },
  query: {
    join: [{ field: 'avatar' }, { field: 'role' }],
  },
}) {
  constructor(public readonly userService: UserService) {
    super(userService);
  }
}
```

## TypeOrmCurdFactoryOptions

#### modal

```js
  {
    modal: {
      type: any,
    },
  }
```

| Parameter | Type  | Required |
| :-------- | :---- | :------- |
| `type`    | `any` | `true`   |

##### Example:

```js
{
    modal: {
      type: User,
    },
  }
```

#### routes

```js
  {
    routes?: {
      findAll?: {
        interceptors?: any[];
        decorators?: (PropertyDecorator | MethodDecorator)[];
      };
      count?: {
        interceptors?: any[];
        decorators?: (PropertyDecorator | MethodDecorator)[];
      };
      findById?: {
        interceptors?: any[];
        decorators?: (PropertyDecorator | MethodDecorator)[];
      };
      create?: {
        interceptors?: any[];
        decorators?: (PropertyDecorator | MethodDecorator)[];
        dto:any
      };
      update?: {
        interceptors?: any[];
        decorators?: (PropertyDecorator | MethodDecorator)[];
        dto:any
      };
      delete?: {
        interceptors?: any[];
        decorators?: (PropertyDecorator | MethodDecorator)[];
      };
    };
  }
```

| Parameter | Type     | Required |
| :-------- | :------- | :------- |
| `findAll` | `object` | `false`  |

##### Example:

```js
routes: {
    findAll: {
      interceptors: [],
      decorators: [],
    },
  }
```

| Parameter | Type     | Required |
| :-------- | :------- | :------- |
| `count`   | `object` | `false`  |

##### Example:

```js
routes: {
    count: {
      interceptors: [],
      decorators: [],
    },
  }
```

| Parameter  | Type     | Required |
| :--------- | :------- | :------- |
| `findById` | `object` | `false`  |

##### Example:

```js
routes: {
    findById: {
      interceptors: [],
      decorators: [],
    },
  }
```

| Parameter | Type     | Required |
| :-------- | :------- | :------- |
| `create`  | `object` | `false`  |

##### Example:

```js
routes: {
    create: {
      interceptors: [],
      decorators: [],
      dto: CreateUserDto
    },
  }
```

| Parameter | Type     | Required |
| :-------- | :------- | :------- |
| `update`  | `object` | `false`  |

##### Example:

```js
routes: {
    update: {
      interceptors: [],
      decorators: [],
      dto: UpdateUserDto
    },
  }
```

| Parameter | Type     | Required |
| :-------- | :------- | :------- |
| `delete`  | `object` | `false`  |

##### Example:

```js
routes: {
    delete: {
      interceptors: [],
      decorators: []
    },
  }
```

#### query

```js
  {
    query: {
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
    },
  }
```

| Parameter        | Type                                                                                | Required |
| :--------------- | :---------------------------------------------------------------------------------- | :------- |
| `fields`         | Array<string>                                                                       | `false`  |
| `filter`         | Array<{field:string, operator:[QueryCondOperator](#QuerySortOperator), value?:any}> | `false`  |
| `or`             | Array<{field:string, operator:[QueryCondOperator](#QuerySortOperator), value?:any}> | `false`  |
| `join`           | Array<{field:string, select?:Array<string>}>                                        | `false`  |
| `sort`           | Array<{field:string, order?:[QuerySortOperator](#QuerySortOperator)}>               | `false`  |
| `pagination`     | boolean                                                                             | `false`  |
| `limit`          | number                                                                              | `false`  |
| `offset`         | number                                                                              | `false`  |
| `page`           | number                                                                              | `false`  |
| `cache`          | boolean                                                                             | `false`  |
| `includeDeleted` | boolean                                                                             | `false`  |

## Reference Type

### QuerySortOperator

| Value  | Description                                                                            |
| :----- | :------------------------------------------------------------------------------------- |
| `ASC`  | `Ascending means smallest to largest, 0 to 9, and/or A to Z`                           |
| `DESC` | `Ascending means a series of data is arranged from high to low or largest to smallest` |

### QueryCondOperator

### filter conditions

- `$eq` (=, equal)
- `$ne` (!=, not equal)
- `$gt` (>, greater than)
- `$lt` (<, lower that)
- `$gte` (>=, greater than or equal)
- `$lte` (<=, lower than or equal)
- `$starts` (LIKE val%, starts with)
- `$ends` (LIKE %val, ends with)
- `$cont` (LIKE %val%, contains)
- `$excl` (NOT LIKE %val%, not contains)
- `$in` (IN, in range, accepts multiple values)
- `$notin` (NOT IN, not in range, accepts multiple values)
- `$isnull` (IS NULL, is NULL, doesn't accept value)
- `$notnull` (IS NOT NULL, not NULL, doesn't accept value)
- `$between` (BETWEEN, between, accepts two values)
- `$eqL` (LOWER(field) =, equal)
- `$neL` (LOWER(field) !=, not equal)
- `$startsL` (LIKE|ILIKE val%)
- `$endsL` (LIKE|ILIKE %val, ends with)
- `$contL` (LIKE|ILIKE %val%, contains)
- `$exclL` (NOT LIKE|ILIKE %val%, not contains)
- `$inL` (LOWER(field) IN, in range, accepts multiple values)
- `$notinL` (LOWER(field) NOT IN, not in range, accepts multiple values)

## Frontend usage

From frontend you can pass the query params as follows

### Without using qs package

| Parameter        | Usage                                                                  |
| :--------------- | :--------------------------------------------------------------------- |
| `fields`         | ?fields[0]=A&fields[1]=B                                               |
| `filter`         | ?filter[0][field]=userName&filter[0][operator]=$eq&filter[0][value]=AB |
| `or`             | ?or[0][field]=userName&or[0][operator]=$eq&or[0][value]=AB             |
| `join`           | ?join[0][field]=role `// Use?join[0][field]=* for all`                 |
| `sort`           | ?sort[0][field]=role&sort[0][order]=DESC                               |
| `limit`          | ?limit=50                                                              |
| `offset`         | ?offset=0                                                              |
| `pagination`     | ?pagination=true                                                       |
| `page`           | ?page=1                                                                |
| `cache`          | ?cache=false                                                           |
| `includeDeleted` | ?includeDeleted=false                                                  |

### With using qs package

```js
const qs = require("qs")
const query = qs.stringify(
  {
    fields: ["id", "userName", "email"], // Use [] for all
    filter: [{ field: "userName", operator: "$eq", value: "AB" }],
    or: [{ field: "userName", operator: "$eq", value: "AB" }],
    join: [{ field: "role" }, { field: "avatar" }], // Use ['*'] for all
    sort: [{ field: "userName", order: "DESC" }],
    limit: 50,
    offset: 0,
    pagination: true,
    page: 1,
    cache: false,
    includeDeleted: false,
  },
  {
    encodeValuesOnly: true, // prettify URL
  }
)
await request("/api/users?{query}")
```

## Authors

- [@prabinkarki643](https://github.com/prabinkarki643)

## Tech Stack

**Server:** Node, Postgress, NestJs, Typescript
