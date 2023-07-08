import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import {
  CURD_CONTROLLER_METADATA_KEY,
  PARSED_CRUD_REQUEST_KEY,
} from '../constants';
import { QueryParams, TypeOrmCurdFactoryOptions } from '../interface';
import { generateParsedCurdRequest } from '../utils';

@Injectable()
export class CurdRequestInterceptor implements NestInterceptor {
  constructor() {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const reflector = new Reflector();
    const req = context.switchToHttp().getRequest();
    const curdOptions = reflector.get(
      CURD_CONTROLLER_METADATA_KEY,
      context.getClass(),
    );

    //Get predefined query-params and merge with request params
    const ClassConstructor = context.getClass();
    const classInstance = new ClassConstructor();
    const factoryOptions: TypeOrmCurdFactoryOptions =
      classInstance?.factoryOptions;
    try {
      if (!req[PARSED_CRUD_REQUEST_KEY]) {
        var parsedQuery = req.query;
        const parsedCurdRequest = generateParsedCurdRequest(
          parsedQuery,
          factoryOptions?.query as QueryParams,
        );
        req[PARSED_CRUD_REQUEST_KEY] = {
          parsed: parsedCurdRequest,
          options: curdOptions,
        };
      }
    } catch (error) {}

    return next.handle();
  }
}
