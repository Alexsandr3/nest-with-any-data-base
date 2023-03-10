import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserSaCommand } from "../create-user-sa-command";
import { UsersService } from "../../../domain/users.service";
import { UsersViewType } from "../../../infrastructure/query-reposirory/types-view/user-View-Model";
import { PreparationUserForDB } from "../../../domain/types/user-preparation-for-DB";
import { randomUUID } from "crypto";
import { add } from "date-fns";
import { Inject } from "@nestjs/common";
import { IUserQueryRepository, IUserQueryRepositoryKey } from "../../../interfaces/IUserQueryRepository";
import { IUserRepository, IUserRepositoryKey } from "../../../interfaces/IUserRepository";
import { CreateUserDto } from "../../../api/input-Dto/create-User-Dto-Model";
import { BadRequestExceptionMY } from "../../../../../helpers/My-HttpExceptionFilter";


@CommandHandler(CreateUserSaCommand)
export class CreateUserSaHandler implements ICommandHandler<CreateUserSaCommand> {
  constructor(


    @Inject(IUserRepositoryKey)
    private readonly usersRepositories: IUserRepository,
    @Inject(IUserQueryRepositoryKey)
    private readonly usersQueryRepositories: IUserQueryRepository,
    private readonly usersService: UsersService,
  ) {
  }

  async execute(command: CreateUserSaCommand): Promise<UsersViewType> {
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
        isConfirmation: true
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
    return await this.usersQueryRepositories.findUser(userId);
  }
  private async validateUser(userInputModel: CreateUserDto): Promise<boolean> {
    //finding user
    const checkLogin = await this.usersRepositories.findByLoginOrEmail(
      userInputModel.login
    );
    if (checkLogin)
      throw new BadRequestExceptionMY({
        message: `Login or Email already in use, do you need choose new data`,
        field: `login`
      });
    const checkEmail = await this.usersRepositories.findByLoginOrEmail(
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
