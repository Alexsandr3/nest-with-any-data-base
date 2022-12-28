import { BadRequestExceptionMY } from "../../../../../helpers/My-HttpExceptionFilter";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersService } from "../../../../users/domain/users.service";
import { ConfirmByCodeCommand } from "../confirmation-by-code-command";
import { UsersSqlRepositories } from "../../../../users/infrastructure/users-sql-repositories";

@CommandHandler(ConfirmByCodeCommand)
export class ConfirmByCodeHandler
  implements ICommandHandler<ConfirmByCodeCommand> {
  constructor(
    private readonly usersSqlRepositories: UsersSqlRepositories,
    private readonly userService: UsersService
  ) {
  }

  async execute(command: ConfirmByCodeCommand): Promise<boolean> {
    const { code } = command.codeInputModel;
    //find user by code
    const user = await this.usersSqlRepositories.findUserByConfirmationCode(code);
    if (!user)
      throw new BadRequestExceptionMY({
        message: `Invalid code, user already registered`,
        field: "code"
      });
    //checking confirmation code for PostrgeSQL
    await this.userService.checkCodeConfirmForSql(user.isConfirmation,
      user.confirmationCode, user.expirationDate,
      code)
    ;
    //checking confirmation code
    //  await this.userService.checkCodeConfirm(user, code);
    //update status code-> true
    return await this.usersSqlRepositories.updateConfirmation(user.user_id);
  }
}
