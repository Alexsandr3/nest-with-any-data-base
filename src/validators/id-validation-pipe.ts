import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { NotFoundExceptionMY } from '../helpers/My-HttpExceptionFilter';

//checking id from uri params
@Injectable()
export class IdValidationPipe implements PipeTransform {
  transform(id: string, metadata: ArgumentMetadata) {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundExceptionMY(`Incorrect id,  please enter a valid one`);
    }
    return id;
  }
}
