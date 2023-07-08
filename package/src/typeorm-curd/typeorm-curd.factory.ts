import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Type,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHideProperty,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { ApiOkResponsePaginated } from './decorators/api-okresponse-paginated.decorator';
import { ApiQueryParams } from './decorators/api-query-params.decorator';
import { ParsedRequest } from './decorators/parsed-request.decorator';
import { UseDecorators } from './decorators/use.decorators';
import { CurdRequestInterceptor } from './interceptors/curd-request.interceptor';
import {
  CurdRequest,
  TypeOrmCurdControllerI,
  TypeOrmCurdFactoryOptions,
} from './interface';
import { TypeOrmCurdService } from './typeorm-curd.service';

export function TypeOrmCurdControllerFactory<T>(
  options?: TypeOrmCurdFactoryOptions,
): Type<TypeOrmCurdControllerI<T>> {
  const { routes, modal } = options || {};

  class TypeOrmCurdController<T> implements TypeOrmCurdControllerI<T> {
    factoryOptions: TypeOrmCurdFactoryOptions;
    constructor(readonly service: TypeOrmCurdService<T>) {
      this.factoryOptions = options;
    }

    @ApiQueryParams()
    @ApiOperation({ summary: 'Find all entries' })
    @ApiOkResponsePaginated(modal.type)
    @UseInterceptors(
      CurdRequestInterceptor,
      ...(routes?.['findAll']?.interceptors || []),
    )
    @UseDecorators(...(routes?.['findAll']?.decorators || []))
    @Get()
    @ApiHideProperty()
    findAll(@ParsedRequest() req: CurdRequest) {
      return this.service.find(req);
    }

    @ApiQueryParams()
    @ApiOperation({ summary: 'Count entries' })
    @UseInterceptors(
      CurdRequestInterceptor,
      ...(routes?.['count']?.interceptors || []),
    )
    @ApiOkResponse({ type: Number })
    @UseDecorators(...(routes?.['count']?.decorators || []))
    @Get('count')
    count(@ParsedRequest() req: CurdRequest) {
      return this.service.count(req);
    }

    @ApiOperation({ summary: 'find entry by id' })
    @ApiOkResponse({ type: modal.type })
    @UseInterceptors(
      CurdRequestInterceptor,
      ...(routes?.['findById']?.interceptors || []),
    )
    @UseDecorators(...(routes?.['findById']?.decorators || []))
    @Get(':id')
    findById(@Param('id') id: string, @ParsedRequest() req: CurdRequest) {
      return this.service.findById(id, req);
    }

    @ApiOperation({ summary: 'Create entry' })
    @ApiOkResponse({ type: modal.type })
    @ApiBody({ type: routes?.['create']?.dto })
    @UseInterceptors(
      CurdRequestInterceptor,
      ...(routes?.['create']?.interceptors || []),
    )
    @UseDecorators(...(routes?.['create']?.decorators || []))
    @Post()
    create(@Body() dto: any, @ParsedRequest() req: CurdRequest) {
      return this.service.create(dto, req);
    }

    @ApiOperation({ summary: 'Update entry' })
    @ApiOkResponse({ type: modal.type })
    @ApiBody({ type: routes?.['update']?.dto })
    @UseInterceptors(
      CurdRequestInterceptor,
      ...(routes?.['update']?.interceptors || []),
    )
    @UseDecorators(...(routes?.['update']?.decorators || []))
    @Put(':id')
    update(
      @Param('id') id: string,
      @Body() dto: any,
      @ParsedRequest() req: CurdRequest,
    ) {
      return this.service.update(id, dto, req);
    }

    @ApiOperation({ summary: 'Delete entry or entries' })
    @ApiParam({
      name: 'id',
      description:
        'For multiple deletion use || for seperating each id eg: 12334||3445',
    })
    @ApiOkResponse({ type: modal.type, isArray: true })
    @UseInterceptors(...(routes?.['delete']?.interceptors || []))
    @UseDecorators(...(routes?.['delete']?.decorators || []))
    @Delete(':id')
    delete(@Param('id') id: string) {
      const ids = id.split('||');
      return this.service.delete(ids);
    }
  }

  return TypeOrmCurdController;
}
