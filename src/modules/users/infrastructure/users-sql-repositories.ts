import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../domain/users-schema-Model";
import { PreparationUserForDB } from "../domain/user-preparation-for-DB";
import { DataSource } from "typeorm";
import { EmailConfirmationSQLType, EmailRecoverySQLType, UserDBSQLType } from "./user-DB-SQL-Type";

@Injectable()
export class UsersSqlRepositories {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly dataSource: DataSource
  ) {
  }

  async createUser(newUser: PreparationUserForDB): Promise<string> {
    const { login, email, passwordHash, createdAt } = newUser.accountData;
    const { isBanned } = newUser.banInfo;
    const { isConfirmation, confirmationCode, expirationDate } = newUser.emailConfirmation;
    const isConfirmationRecovery = newUser.emailRecovery.isConfirmation;
    const expirationDateRecovery = newUser.emailRecovery.expirationDate;
    const recoveryCodeRecovery = newUser.emailRecovery.recoveryCode;

    const query = `
        WITH ins1 AS (
        INSERT
        INTO users(login, email, "passwordHash", "createdAt", "isBanned")
        VALUES ('${login}', '${email}', '${passwordHash}', '${createdAt}', '${isBanned}')
            RETURNING user_id
            ), ins2 AS (
        INSERT
        INTO user_email_confirmation(user_id, "confirmationCode", "expirationDate", "isConfirmation")
        SELECT ins1.user_id, '${confirmationCode}', '${expirationDate.toISOString()}', '${isConfirmation}'
        FROM ins1
            )
        INSERT
        INTO user_email_recovery(user_id, "recoveryCode", "expirationDate", "isConfirmation")
        SELECT ins1.user_id,
               '${recoveryCodeRecovery}',
               '${expirationDateRecovery.toISOString()}',
               '${isConfirmationRecovery}'
        FROM ins1 RETURNING user_id;
    `;
    const usersId = await this.dataSource.query(query);
    const { user_id } = usersId[0];
    return user_id;
  }

  async deleteUser(id: string): Promise<boolean> {
    const query = `
        DELETE
        FROM user_email_confirmation
        WHERE user_id = '${id}';
        DELETE
        FROM user_email_recovery
        WHERE user_id = '${id}';
        DELETE
        FROM users
        WHERE user_id = '${id}';
    `;
    await this.dataSource.query(query);
    return true;

    // const result = await this.userModel.deleteOne({ _id: new ObjectId(id) });
    // return result.deletedCount === 1;
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
        WHERE user_id = '${userId}'
    `;
    const res = await this.dataSource.query(query);
    return res[0];
  }

  async updateConfirmation(user_id: string): Promise<boolean> {
    const query = `
        UPDATE user_email_confirmation
        SET "isConfirmation"= true
        WHERE user_id = '${user_id}';
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
        SET "recoveryCode"='${code}', "expirationDate"='${expirationDate.toISOString()}'
        WHERE user_id = '${userId}';
       
    `;
    const res = await this.dataSource.query(query);
    if (res[1] === 0) throw new Error("not today");
    return true;
  }

  async updateRecovery(userId: string, passwordHash: string): Promise<boolean> {
    const query = `
        UPDATE users
        SET "passwordHash"='${passwordHash}'
        WHERE user_id = '${userId}';
        UPDATE user_email_recovery
        SET "isConfirmation"= true
        WHERE user_id = '${userId}';
    `;
    await this.dataSource.query(query);
    // if (res[1] === 0) throw new Error("not today");
    return true;
  }

  async updateCodeConfirmation(userId: string, code: string, expirationDate: Date): Promise<boolean> {
    const query = `
        UPDATE user_email_confirmation
        SET "confirmationCode"='${code}', "expirationDate"='${expirationDate.toISOString()}'
        WHERE user_id = '${userId}';
    `;
    const res = await this.dataSource.query(query);
    if (res[1] === 0) throw new Error("not today");
    return true;
  }

  async updateBanInfoUser(userId: string, isBanned: boolean, banDate: string, banReason: string): Promise<boolean> {
    const query = `
        UPDATE users
        SET "isBanned"=${isBanned},
            "banDate"=${banDate ? `'${banDate}'` : null},
            "banReason"=${banReason ? `'${banReason}'` : null}
        WHERE user_id = '${userId}';
    `;
    const res = await this.dataSource.query(query);
    if (res[1] === 0) throw new Error("not today");
    return res[0];
  }

  // async findBanStatusUser(userId: string): Promise<UserDocument> {
  //   const banStatus = await this.userModel.findOne({ userId: userId });
  //   if (!banStatus) return null;
  //   return banStatus;
  // }

  async findUserByIdWithMapped(userId: string): Promise<UserDBSQLType> {
    const query = `
        SELECT *
        FROM users
        WHERE user_id = '${userId}'
    `;
    const user = await this.dataSource.query(query);
    if (!user[0]) return null;
    return user[0];
  }
}
