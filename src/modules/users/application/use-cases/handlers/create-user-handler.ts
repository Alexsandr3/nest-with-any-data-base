import { HttpException } from "@nestjs/common";
import { CreateUserDto } from "../../../api/input-Dto/create-User-Dto-Model";
import { UsersViewType } from "../../../infrastructure/query-reposirory/types-view/user-View-Model";
import { MailService } from "../../../../mail/mail.service";
import { randomUUID } from "crypto";
import { BadRequestExceptionMY } from "../../../../../helpers/My-HttpExceptionFilter";
import { add } from "date-fns";
import { PreparationUserForDB } from "../../../domain/types/user-preparation-for-DB";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserCommand } from "../create-user-command";
import { UsersService } from "../../../domain/users.service";
import { UsersSqlRepositories } from "../../../infrastructure/users-sql-repositories";
import { UsersSqlQueryRepositories } from "../../../infrastructure/query-reposirory/users-sql-query.reposit";


@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersSqlRepositories: UsersSqlRepositories,
    private readonly usersSqlQueryRepositories: UsersSqlQueryRepositories,
    private readonly usersService: UsersService,
    private readonly mailService: MailService
  ) {
  }

  async execute(command: CreateUserCommand): Promise<UsersViewType> {
    const { email, login, password } = command.userInputModel;
    //email verification and login for uniqueness
    await this.validateUser(command.userInputModel);
    //generation Hash
    const passwordHash = await this.usersService.generateHash(password);
    // preparation data User for DB
    const user = new PreparationUserForDB(
      {
        login,
        email,
        passwordHash,
        createdAt: new Date().toISOString()
      },
      {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), { hours: 1 }),
        isConfirmation: false
      },
      {
        recoveryCode: randomUUID(),
        expirationDate: add(new Date(), { hours: 1 }),
        isConfirmation: false
      },
      {
        isBanned: false,
        banDate: null,
        banReason: null
      }
    );
    const userId = await this.usersSqlRepositories.createUser(user);
    //finding user for View
    const foundUser = await this.usersSqlQueryRepositories.findUser(userId);
    try {
      //send mail for confirmation
      await this.mailService.sendUserConfirmation(
        foundUser.email,
        user.emailConfirmation.confirmationCode
      );
    } catch (error) {
      console.error(error);
      //if not saved user - him need remove ??
      //await this.usersRepositories.deleteUser(userId);
      throw new HttpException(
        "Service is unavailable. Please try again later. We need saved User",
        421
      );
    }
    return foundUser;
  }

  private async validateUser(userInputModel: CreateUserDto): Promise<boolean> {
    //finding user
    const checkLogin = await this.usersSqlRepositories.findByLoginOrEmail(
      userInputModel.login
    );
    if (checkLogin)
      throw new BadRequestExceptionMY({
        message: `Login or Email already in use, do you need choose new data`,
        field: `login`
      });
    const checkEmail = await this.usersSqlRepositories.findByLoginOrEmail(
      userInputModel.email
    );
    if (checkEmail)
      throw new BadRequestExceptionMY({
        message: `Login or Email already in use, do you need choose new data`,
        field: `email`
      });
    return true;
  }
}
