import { registerDecorator, ValidationOptions } from 'class-validator';
import { BlogIdValidator } from "../validators/is-mongo-id-validator.service";

export function IsMongoIdObject(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsMongoIdObject',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: BlogIdValidator,
      //validator: { validate(value: any) {return ObjectId.isValid(value)}}
    });
  };
}
