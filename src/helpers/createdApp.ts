import { BadRequestException, INestApplication, ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { ErrorExceptionFilter, HttpExceptionFilter } from "../filters/exception.filter";
import { useContainer } from "class-validator";
import { AppModule } from "../app.module";

export const createdApp = (app: INestApplication) => {
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, //data from input DTO
    //forbidNonWhitelisted: true, //stopping create data
    transform: true, //transform data to correct
    stopAtFirstError: true,
    transformOptions: {enableImplicitConversion: true},
    exceptionFactory: (errors) => {
      const errorsForRes = [];
      errors.forEach((e) => {
        // errorsForRes.push({field: e.property})
        const constrainKeys = Object.keys(e.constraints);
        constrainKeys.forEach((ckey) => {
          errorsForRes.push({
            message: e.constraints[ckey],
            field: e.property
          });
        });
      });
      throw new BadRequestException(errorsForRes);
    }
  }));
  app.enableCors({});
  app.use(cookieParser());
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  return app;
};