import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const PayloadRefresh = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.payload;
  },
);
