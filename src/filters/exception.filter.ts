import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

//filter for dev
@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    if (process.env.envoirment !== `production`) {
      response
        .status(500)
        .send({ error: exception.toString(), stack: exception.stack });
    } else {
      response.status(500).send(`some error occurred`);
    }
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === 400) {
      const errorResponse = [];
      const responseBody: any = exception.getResponse();
      try {
        responseBody.message.forEach((m) => errorResponse.push(m));
        response.status(status).json({
          errorsMessages: errorResponse,
        });
      } catch (e) {
        return response.status(status).send({
          errorsMessages: [responseBody],
        });
      }
    } else {
      return response.status(status).send(exception.message);
    }
  }
}
