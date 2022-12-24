import { PreparationUserBanInfoForDB } from "./user-ban-info-preparation-for-DB";

export class PreparationUserForDB {
  constructor(
    public accountData: AccountDataType,
    public emailConfirmation: EmailConfirmationType,
    public emailRecovery: EmailRecoveryType,
    public banInfo: PreparationUserBanInfoForDB,
  ) {}
}

export class AccountDataType {
  constructor(
    public login: string,
    public email: string,
    public passwordHash: string,
    public createdAt: string,
  ) {}
}

export class EmailConfirmationType {
  constructor(
    public confirmationCode: string,
    public expirationDate: Date,
    public isConfirmation: boolean,
  ) {}
}

export class EmailRecoveryType {
  constructor(
    public recoveryCode: string,
    public expirationDate: Date,
    public isConfirmation: boolean,
  ) {}
}
