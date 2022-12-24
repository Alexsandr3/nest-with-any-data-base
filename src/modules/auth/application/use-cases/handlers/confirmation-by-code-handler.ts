import { BadRequestExceptionMY } from '../../../../../helpers/My-HttpExceptionFilter';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepositories } from '../../../../users/infrastructure/users-repositories';
import { UsersService } from '../../../../users/domain/users.service';
import { ConfirmByCodeCommand } from '../confirmation-by-code-command';

@CommandHandler(ConfirmByCodeCommand)
export class ConfirmByCodeHandler
  implements ICommandHandler<ConfirmByCodeCommand>
{
  constructor(
    private readonly usersRepositories: UsersRepositories,
    private readonly userService: UsersService,
  ) {}

  async execute(command: ConfirmByCodeCommand): Promise<boolean> {
    const { code } = command.codeInputModel;
    //find user by code
    const user = await this.usersRepositories.findUserByConfirmationCode(code);
    if (!user)
      throw new BadRequestExceptionMY({
        message: `Invalid code, user already registered`,
        field: 'code',
      });
    //checking confirmation code
    await this.userService.checkCodeConfirm(user, code);
    //update status code-> true
    return await this.usersRepositories.updateConfirmation(user._id);
  }
}
