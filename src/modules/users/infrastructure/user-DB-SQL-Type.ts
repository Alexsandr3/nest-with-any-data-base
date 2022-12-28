
export class UserDBSQLType {
  constructor(
    public user_id: string,
    public login: string,
    public email: string,
    public passwordHash: string,
    public createdAt: string,
    public isBanned: boolean,
    public banDate: string,
    public banReason: string,
  ) {}
}

export class EmailConfirmationSQLType {
  constructor(
    public user_id: string,
    public confirmationCode: string,
    public expirationDate: Date,
    public isConfirmation: boolean,
  ) {}
}

export class EmailRecoverySQLType {
  constructor(
    public user_id: string,
    public recoveryCode: string,
    public expirationDate: Date,
    public isConfirmation: boolean,
  ) {}
}
