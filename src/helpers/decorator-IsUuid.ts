import { registerDecorator, ValidationOptions } from 'class-validator';
import { BlogUuidIdValidator } from "../validators/is-uuid-id-validator.service";

export function IsUuidCustom(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsUuidCustom',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: BlogUuidIdValidator,
      //validator: { validate(value: any) {return ObjectId.isValid(value)}}
    });
  };
}
