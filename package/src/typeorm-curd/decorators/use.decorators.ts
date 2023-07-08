import { applyDecorators } from '@nestjs/common';

export function UseDecorators(
  ...decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[]
) {
  return applyDecorators(...decorators);
}
