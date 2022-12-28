import { ObjectId } from 'mongodb';
import {
  AccountDataType,
  EmailConfirmationType,
  EmailRecoveryType,
} from '../domain/user-preparation-for-DB';

export class UsersDBType {
  constructor(
    public _id: ObjectId,
    public accountData: AccountDataType,
    public emailConfirmation: EmailConfirmationType,
    public emailRecovery: EmailRecoveryType,
  ) {}
}
