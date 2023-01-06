import { Injectable } from "@nestjs/common";
import { PreparationUserForDB } from "../domain/types/user-preparation-for-DB";
import { DataSource } from "typeorm";
import { EmailConfirmationSQLType, EmailRecoverySQLType, UserDBSQLType } from "../domain/types/user-DB-SQL-Type";
import { IUserRepository } from "../interfaces/IUserRepository";

@Injectable()
export class UsersSqlRepositories implements IUserRepository {
  constructor(
    private readonly dataSource: DataSource
  ) {
  }

  async createUser(newUser: PreparationUserForDB): Promise<string> {
    const { login, email, passwordHash, createdAt } = newUser.accountData;
    const { isBanned } = newUser.banInfo;
    const { isConfirmation, confirmationCode, expirationDate } = newUser.emailConfirmation;
    const isConfirmationRecovery = newUser.emailRecovery.isConfirmation;
    const expirationDateRecovery = newUser.emailRecovery.expirationDate;
    const { recoveryCode } = newUser.emailRecovery;

    const query = `
        WITH ins1 AS (
        INSERT
        INTO users(login, email, "passwordHash", "createdAt", "isBanned")
        VALUES ('${login}', '${email}', '${passwordHash}', '${createdAt}', '${isBanned}')
            RETURNING "userId"
            ), ins2 AS (
        INSERT
        INTO user_email_confirmation("userId", "confirmationCode", "expirationDate", "isConfirmation")
        SELECT ins1."userId", '${confirmationCode}', '${expirationDate.toISOString()}', '${isConfirmation}'
        FROM ins1
            )
        INSERT
        INTO user_email_recovery("userId", "recoveryCode", "expirationDate", "isConfirmation")
        SELECT ins1."userId",
               '${recoveryCode}',
               '${expirationDateRecovery.toISOString()}',
               '${isConfirmationRecovery}'
        FROM ins1 RETURNING "userId";
    `;
    const usersId = await this.dataSource.query(query);
    const { userId } = usersId[0];
    return userId;
  }

  async deleteUser(id: string): Promise<boolean> {
    const query = `
        DELETE
        FROM user_email_confirmation
        WHERE "userId" = '${id}';
        DELETE
        FROM user_email_recovery
        WHERE "userId" = '${id}';
        DELETE
        FROM users
        WHERE "userId" = '${id}';
    `;
    await this.dataSource.query(query);
    return true;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDBSQLType> {
    const query = `
        SELECT *
        FROM users
        WHERE login = '${loginOrEmail}'
           OR email = '${loginOrEmail}'
    `;
    const user = await this.dataSource.query(query);
    return user[0];
  }

  async findUserByConfirmationCode(confirmationCode: string): Promise<EmailConfirmationSQLType> {
    const query = `
        SELECT *
        FROM user_email_confirmation
        WHERE "confirmationCode" = '${confirmationCode}'
    `;
    const res = await this.dataSource.query(query);
    return res[0];
  }

  async findUserByUserId(userId: string): Promise<EmailConfirmationSQLType> {
    const query = `
        SELECT *
        FROM user_email_confirmation
        WHERE "userId" = '${userId}'
    `;
    const res = await this.dataSource.query(query);
    return res[0];
  }

  async updateConfirmation(user_id: string): Promise<boolean> {
    const query = `
        UPDATE user_email_confirmation
        SET "isConfirmation"= true
        WHERE "userId" = '${user_id}';
    `;
    const res = await this.dataSource.query(query);
    if (res[1] === 0) throw new Error("not today");
    return res;
  }

  async findUserByRecoveryCode(recoveryCode: string): Promise<EmailRecoverySQLType> {
    const query = `
        SELECT *
        FROM user_email_recovery
        WHERE "recoveryCode" = '${recoveryCode}'
    `;
    const res = await this.dataSource.query(query);
    return res[0];

  }

  async updateCodeRecovery(userId: string, code: string, expirationDate: Date): Promise<boolean> {
    const query = `
        UPDATE user_email_recovery
        SET "recoveryCode"='${code}',
            "expirationDate"='${expirationDate.toISOString()}'
        WHERE "userId" = '${userId}';

    `;
    const res = await this.dataSource.query(query);
    if (res[1] === 0) throw new Error("not today");
    return true;
  }

  async updateRecovery(userId: string, passwordHash: string): Promise<boolean> {
    const query = `
        UPDATE users
        SET "passwordHash"='${passwordHash}'
        WHERE "userId" = '${userId}';
        UPDATE user_email_recovery
        SET "isConfirmation"= true
        WHERE "userId" = '${userId}';
    `;
    await this.dataSource.query(query);
    return true;
  }

  async updateCodeConfirmation(userId: string, code: string, expirationDate: Date): Promise<boolean> {
    const query = `
        UPDATE user_email_confirmation
        SET "confirmationCode"='${code}',
            "expirationDate"='${expirationDate.toISOString()}'
        WHERE "userId" = '${userId}';
    `;
    const res = await this.dataSource.query(query);
    if (res[1] === 0) throw new Error("not today");
    return true;
  }

  async updateBanInfoUser(userId: string, isBanned: boolean, banDate: string, banReason: string): Promise<boolean> {
    const query = `
        UPDATE "users"
        SET "isBanned"  = ${isBanned},
            "banDate"   = ${banDate ? `'${banDate}'` : null},
            "banReason" = ${banReason ? `'${banReason}'` : null}
        WHERE "userId" = '${userId}'
    `;

    const res = await this.dataSource.query(query);
    if (res[1] === 0) throw new Error("not today");
    return true;
  }

  async findUserByIdWithMapped(userId: string): Promise<UserDBSQLType> {
    const query = `
        SELECT *
        FROM users
        WHERE "userId" = '${userId}'
    `;
    const user = await this.dataSource.query(query);
    if (!user[0]) return null;
    return user[0];
  }
}
