import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserSaCommand } from "../create-user-sa-command";
import { UsersService } from "../../../domain/users.service";
import { UsersViewType } from "../../../infrastructure/query-reposirory/user-View-Model";
import { PreparationUserForDB } from "../../../domain/user-preparation-for-DB";
import { randomUUID } from "crypto";
import { add } from "date-fns";
import { CreateUserDto } from "../../../api/input-Dto/create-User-Dto-Model";
import { BadRequestExceptionMY } from "../../../../../helpers/My-HttpExceptionFilter";
import { UsersSqlRepositories } from "../../../infrastructure/users-sql-repositories";
import { UsersSqlQueryRepositories } from "../../../infrastructure/query-reposirory/users-sql-query.reposit";


@CommandHandler(CreateUserSaCommand)
export class CreateUserSaHandler implements ICommandHandler<CreateUserSaCommand> {
  constructor(
    private readonly usersSqlRepositories: UsersSqlRepositories,
    private readonly usersSqlQueryRepositories: UsersSqlQueryRepositories,
    private readonly usersService: UsersService
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
    const userId = await this.usersSqlRepositories.createUser(user);
    //finding user for View
    return await this.usersSqlQueryRepositories.findUser(userId);
  }
  private async validateUser(userInputModel: CreateUserDto): Promise<boolean> {
    //finding user
    const checkUser = await this.usersSqlRepositories.findByLoginAndEmail(
      userInputModel.login, userInputModel.email
    );
    if (checkUser)
      throw new BadRequestExceptionMY({
        message: `Login or Email already in use, do you need choose new data`,
        field: `login`
      });
    return true;
  }
}
