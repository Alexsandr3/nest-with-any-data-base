import { UsersRepositories } from "../infrastructure/users-repositories";
import { UsersSqlRepositories } from "../infrastructure/users-sql-repositories";
import { PreparationUserForDB } from "../domain/types/user-preparation-for-DB";
import { EmailConfirmationSQLType, EmailRecoverySQLType, UserDBSQLType } from "../domain/types/user-DB-SQL-Type";

export interface IUserRepository {

  createUser(newUser: PreparationUserForDB): Promise<string>;

  deleteUser(id: string): Promise<boolean>;

  findByLoginOrEmail(loginOrEmail: string): Promise<UserDBSQLType>;

  findUserByConfirmationCode(confirmationCode: string): Promise<EmailConfirmationSQLType>;

  findUserByUserId(userId: string): Promise<EmailConfirmationSQLType>;

  updateConfirmation(user_id: string): Promise<boolean>;

  findUserByRecoveryCode(recoveryCode: string): Promise<EmailRecoverySQLType>;

  updateCodeRecovery(userId: string, code: string, expirationDate: Date): Promise<boolean>;

  updateRecovery(userId: string, passwordHash: string): Promise<boolean>;

  updateCodeConfirmation(userId: string, code: string, expirationDate: Date): Promise<boolean>;

  updateBanInfoUser(userId: string, isBanned: boolean, banDate: string, banReason: string): Promise<boolean>;

  findUserByIdWithMapped(userId: string): Promise<UserDBSQLType>;

}

export const IUserRepositoryKey = "IUserRepository";


export const UserRepository = () => {
  const dbType = process.env.DB_TYPE;
  switch (dbType) {
    case "MongoDB":
      return {
        provide: IUserRepositoryKey,
        useClass: UsersRepositories
      };
    case "RawSQL":
      return {
        provide: IUserRepositoryKey,
        useClass: UsersSqlRepositories
      };
    default:
      return {
        provide: IUserRepositoryKey,
        useClass: UsersSqlRepositories
      };
  }
};