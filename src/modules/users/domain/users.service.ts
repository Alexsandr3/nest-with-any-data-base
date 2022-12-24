import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BadRequestExceptionMY } from '../../../helpers/My-HttpExceptionFilter';
import { UsersDBType } from './user-DB-Type';

@Injectable()
export class UsersService {
  constructor() {}

  public generateHash(password: string) {
    return bcrypt.hash(password, 10);
  }

  public checkCodeConfirm(user: UsersDBType, code: string) {
    if (user.emailConfirmation.isConfirmation)
      throw new BadRequestExceptionMY({
        message: `Code has confirmation already`,
        field: 'code',
      });
    if (user.emailConfirmation.confirmationCode !== code)
      throw new BadRequestExceptionMY({
        message: `Company is not confirmed`,
        field: 'code',
      });
    if (user.emailConfirmation.expirationDate < new Date())
      throw new BadRequestExceptionMY({
        message: `Confirmation has expired`,
        field: 'code',
      });
    return;
  }

  public checkUser(isConfirmation: boolean, expirationDate: Date) {
    if (isConfirmation)
      throw new BadRequestExceptionMY({
        message: `Code has confirmation already`,
        field: 'email',
      });
    if (expirationDate < new Date())
      throw new BadRequestExceptionMY({
        message: `Confirmation has expired`,
        field: 'email',
      });
    return;
  }

}
