import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

//checking id from uri params
@ValidatorConstraint({ name: "Trim" })
@Injectable()
export class TrimValidatorService implements ValidatorConstraintInterface {
  validate(value: string) {
    try {
      const res = value.trim();
      return res.length > 0;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return "This field can't be empty";
  }
}
