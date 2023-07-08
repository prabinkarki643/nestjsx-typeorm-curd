import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PARSED_CRUD_REQUEST_KEY } from '../constants';

export const ParsedRequest = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req[PARSED_CRUD_REQUEST_KEY];
  },
);
