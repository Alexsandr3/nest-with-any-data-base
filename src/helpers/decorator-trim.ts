import { registerDecorator, ValidationOptions } from "class-validator";
import { TrimValidatorService } from "../validators/trim-validator.service";

export function Trim(validationOptions?: ValidationOptions) {
  return function(object: any, propertyName: string) {
    registerDecorator({
      name: "Trim",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: TrimValidatorService
    });
  };
}
