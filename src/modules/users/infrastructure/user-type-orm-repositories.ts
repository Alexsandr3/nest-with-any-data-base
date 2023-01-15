import { Injectable } from "@nestjs/common";
import { PreparationUserForDB } from "../domain/types/user-preparation-for-DB";
import { Repository } from "typeorm";
import { EmailConfirmationSQLType, EmailRecoverySQLType, UserDBSQLType } from "../domain/types/user-DB-SQL-Type";
import { IUserRepository } from "../interfaces/IUserRepository";
import { InjectRepository } from "@nestjs/typeorm";
import { EmailConfirmation } from "../../../entities/emailConfirmation.entity";
import { EmailRecovery } from "../../../entities/emailRecovery.entity";
import { Usser } from "../../../entities/user.entity";

@Injectable()
export class UserTypeOrmRepositories implements IUserRepository {
  constructor(
    @InjectRepository(Usser)
    private readonly userRepo: Repository<Usser>,
    @InjectRepository(EmailConfirmation)
    private readonly confirmationRepo: Repository<EmailConfirmation>,
    @InjectRepository(EmailRecovery)
    private readonly recoveryRepo: Repository<EmailRecovery>
  ) {
  }

  async createUser(newUser: PreparationUserForDB): Promise<string> {
    const { login, email, passwordHash, createdAt } = newUser.accountData;
    const { isConfirmation, confirmationCode, expirationDate } = newUser.emailConfirmation;
    const expirationDateRecovery = newUser.emailRecovery.expirationDate;
    const { recoveryCode } = newUser.emailRecovery;
    const user = new Usser();
    user.login = login;
    user.email = email;
    user.passwordHash = passwordHash;
    user.createdAt = createdAt;
    const createdUser = await this.userRepo.save(user);
    //create instance emailConfirmation for user
    const userConfirmation = new EmailConfirmation();
    userConfirmation.userId = createdUser.userId;
    userConfirmation.confirmationCode = confirmationCode;
    userConfirmation.expirationDate = expirationDate;
    userConfirmation.isConfirmation = isConfirmation;
    await this.confirmationRepo.save(userConfirmation);
    //create instance emailRecovery for user
    const userRecovery = new EmailRecovery();
    userRecovery.userId = createdUser.userId;
    userRecovery.recoveryCode = recoveryCode;
    userRecovery.expirationDate = expirationDateRecovery;
    await this.recoveryRepo.save(userRecovery);
    return createdUser.userId;
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.userRepo.manager.connection.transaction(async manager => {
        await manager.createQueryBuilder()
          .delete()
          .from("usser")
          .where("userId = :id", { id })
          .execute();
        await manager.createQueryBuilder()
          .delete()
          .from("email_confirmation")
          .where("userId = :id", { id })
          .execute();
        await manager.createQueryBuilder()
          .delete()
          .from("email_recovery")
          .where("userId = :id", { id })
          .execute();
      }
    ).catch((e) => {
      return console.log(e);
    });
    return true;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDBSQLType> {
    return this.userRepo.findOneBy([{ login: loginOrEmail }, { email: loginOrEmail }]);
  }

  async findUserByConfirmationCode(confirmationCode: string): Promise<EmailConfirmationSQLType> {
    return this.confirmationRepo.findOneBy({ confirmationCode: confirmationCode });
    // const query = `
    //     SELECT *
    //     FROM user_email_confirmation
    //     WHERE "confirmationCode" = '${confirmationCode}'
    // `;
    // const res = await this.userRepo.query(query);
  }

  async findUserByUserId(userId: string): Promise<EmailConfirmationSQLType> {
    return await this.confirmationRepo
      .findOneBy({ userId: userId });
  }

  async updateConfirmation(user_id: string): Promise<boolean> {
    await this.confirmationRepo.manager.connection.transaction(async manager => {
      await manager.update(EmailConfirmation, {
        userId: user_id
      }, {
        isConfirmation: true
      });
    })
      .catch((e) => {
        console.log(e);
      });
    return true;
  }

  async findUserByRecoveryCode(recoveryCode: string): Promise<EmailRecoverySQLType> {
    return await this.recoveryRepo
      .findOneBy({ recoveryCode: recoveryCode });
  }

  async updateCodeRecovery(userId: string, code: string, expirationDate: Date): Promise<boolean> {
    await this.recoveryRepo.manager.connection.transaction(async manager => {
      await manager.update(EmailRecovery,
        { userId: userId },
        { recoveryCode: code, expirationDate: expirationDate }
      );
    })
      .catch((e) => {
        console.log(e);
      });
    return true;
  }

  async updateRecovery(userId: string, passwordHash: string): Promise<boolean> {
    await this.confirmationRepo.manager.connection.transaction(async manager => {
      await manager.update(Usser,
        { userId: userId },
        { passwordHash: passwordHash }
      );
      await manager.update(EmailRecovery,
        { userId: userId },
        { isConfirmation: true }
      );
    })
      .catch((e) => {
        console.log(e);
      });
    return true;
  }

  async updateCodeConfirmation(userId: string, code: string, expirationDate: Date): Promise<boolean> {
    await this.confirmationRepo.manager.connection.transaction(async manager => {
      await manager.update(EmailConfirmation,
        { userId: userId },
        { confirmationCode: code, expirationDate: expirationDate }
      );
    })
      .catch((e) => {
        console.log(e);
      });
    return true;
  }

  async updateBanInfoUser(userId: string, isBanned: boolean, banDate: string, banReason: string): Promise<boolean> {
    // const query = `
    //     UPDATE "users"
    //     SET "isBanned"  = ${isBanned},
    //         "banDate"   = ${banDate ? `'${banDate}'` : null},
    //         "banReason" = ${banReason ? `'${banReason}'` : null}
    //     WHERE "userId" = '${userId}'
    // `;
    //
    // const res = await this.userRepo.query(query);
    // if (res[1] === 0) throw new Error("not today");
    // return true;
    await this.userRepo.manager.connection.transaction(async manager => {
      await manager.update(Usser,
        { userId: userId },
        { isBanned: isBanned, banDate: banDate, banReason: banReason }
      );
    })
      .catch((e) => {
        console.log(e);
      });
    return true;
  }

  async findUserByIdWithMapped(userId: string): Promise<UserDBSQLType> {
    const user = await this.userRepo.findOneBy({ userId: userId });
    if (!user) return null;
    return user;
  }
}
