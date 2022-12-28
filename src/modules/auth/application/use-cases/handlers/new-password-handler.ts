import { BadRequestExceptionMY } from '../../../../../helpers/My-HttpExceptionFilter';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NewPasswordCommand } from '../new-password-command';
import { UsersService } from '../../../../users/domain/users.service';
import { UsersSqlRepositories } from "../../../../users/infrastructure/users-sql-repositories";

@CommandHandler(NewPasswordCommand)
export class NewPasswordHandler implements ICommandHandler<NewPasswordCommand> {
  constructor(
    private readonly usersSqlRepositories: UsersSqlRepositories,
    private readonly usersService: UsersService,
  ) {}

  async execute(command: NewPasswordCommand): Promise<boolean> {
    const { newPassword, recoveryCode } = command.newPasswordInputModel;
    //search user by code
    const user = await this.usersSqlRepositories.findUserByRecoveryCode(
      recoveryCode,
    );
    if (!user)
      throw new BadRequestExceptionMY({
        message: `Incorrect input data`,
        field: 'code',
      });
    //check code confirmation for Sql
    await this.usersService.checkCodeConfirmForSql(user.isConfirmation,
      user.recoveryCode, user.expirationDate, recoveryCode);
    // await this.usersService.checkCodeConfirm(user, recoveryCode);
    //generation new passwordHash for save
    const passwordHash = await this.usersService.generateHash(newPassword);
    return await this.usersSqlRepositories.updateRecovery(user.user_id, passwordHash);
  }
}
