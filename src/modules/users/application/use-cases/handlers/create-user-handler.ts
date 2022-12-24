import { HttpException } from "@nestjs/common";
import { CreateUserDto } from "../../../api/input-Dto/create-User-Dto-Model";
import { UsersRepositories } from "../../../infrastructure/users-repositories";
import { UsersQueryRepositories } from "../../../infrastructure/query-reposirory/users-query.reposit";
import { UsersViewType } from "../../../infrastructure/query-reposirory/user-View-Model";
import { MailService } from "../../../../mail/mail.service";
import { randomUUID } from "crypto";
import { BadRequestExceptionMY } from "../../../../../helpers/My-HttpExceptionFilter";
import { add } from "date-fns";
import { PreparationUserForDB } from "../../../domain/user-preparation-for-DB";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserCommand } from "../create-user-command";
import { UsersService } from "../../../domain/users.service";


@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersRepositories: UsersRepositories,
    private readonly usersQueryRepositories: UsersQueryRepositories,
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
    const userId = await this.usersRepositories.createUser(user);
    //finding user for View
    const foundUser = await this.usersQueryRepositories.findUser(userId);
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
    //find user
    const checkEmail = await this.usersRepositories.findByLoginOrEmail(
      userInputModel.email
    );
    if (checkEmail)
      throw new BadRequestExceptionMY({
        message: `${userInputModel.email}  already in use, do you need choose new data`,
        field: `email`
      });
    const checkLogin = await this.usersRepositories.findByLoginOrEmail(
      userInputModel.login
    );
    if (checkLogin)
      throw new BadRequestExceptionMY({
        message: `${userInputModel.login}  already in use, do you need choose new data`,
        field: `login`
      });
    return true;
  }
}
