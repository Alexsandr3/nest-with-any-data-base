import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UnauthorizedExceptionMY } from '../helpers/My-HttpExceptionFilter';

export const CurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    debugger;
    const request = context.switchToHttp().getRequest();
    if (!request.userId) request.userId = null; //throw new UnauthorizedExceptionMY(`UserId didn't come`)
    return request.userId;
  },
);

export const CurrentUserIdBlogger = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!request.userId)
      throw new UnauthorizedExceptionMY(`UserId didn't come`);
    return request.userId;
  },
);
