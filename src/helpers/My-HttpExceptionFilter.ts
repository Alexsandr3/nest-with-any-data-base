import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

//model for 404 - `Not Found` error
export class NotFoundExceptionMY {
  constructor(message) {
    throw new NotFoundException(message);
  }
}

//model for 400 - `BAD_REQUEST` error
export class BadRequestExceptionMY {
  constructor(message) {
    throw new BadRequestException(message);
  }
}

//model for 401 - `Unauthorized` error
export class UnauthorizedExceptionMY {
  constructor(message) {
    throw new UnauthorizedException(message);
  }
}

//model for 403 - `Forbidden` error
export class ForbiddenExceptionMY {
  constructor(message) {
    throw new ForbiddenException(message);
  }
}

export const HTTP_STATUSES = {
  OK_200: 200,
  CREATED_201: 201,
  NO_CONTENT_204: 204,

  BAD_REQUEST_400: 400,
  UNAUTHORIZED_401: 401,
  FORBIDDEN_403: 403,
  NOT_FOUND_404: 404,
  TOO_MUCH_REQUESTS_429: 429,

  INTERNET_SERVER_ERROR: 500,
};
