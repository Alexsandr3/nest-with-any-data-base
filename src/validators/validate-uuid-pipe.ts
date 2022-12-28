import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { NotFoundExceptionMY } from '../helpers/My-HttpExceptionFilter';
import { isUUID } from "class-validator";

//checking id from uri params
@Injectable()
export class ValidateUuidPipe implements PipeTransform {
  transform(id: string, metadata: ArgumentMetadata) {
    if (!isUUID(id)){
      throw new NotFoundExceptionMY(`Incorrect id,  please enter a valid one`);
    }
    return id;
  }
}
