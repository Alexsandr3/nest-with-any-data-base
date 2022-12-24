import { BadRequestExceptionMY } from '../../../../../helpers/My-HttpExceptionFilter';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResendingCommand } from '../resending-command';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { HttpException } from '@nestjs/common';
import { UsersRepositories } from '../../../../users/infrastructure/users-repositories';
import { UsersService } from '../../../../users/domain/users.service';
import { MailService } from '../../../../mail/mail.service';

@CommandHandler(ResendingCommand)
export class ResendingHandler implements ICommandHandler<ResendingCommand> {
  constructor(
    private readonly usersRepositories: UsersRepositories,
    private readonly userService: UsersService,
    private readonly mailService: MailService,
  ) {}

  async execute(command: ResendingCommand): Promise<boolean> {
    const { email } = command.resendingInputModel;
    //search user by email
    const user = await this.usersRepositories.findByLoginOrEmail(email);
    if (!user)
      throw new BadRequestExceptionMY({
        message: `Incorrect input data`,
        field: 'email',
      });
    //check code
    await this.userService.checkUser(
      user.emailConfirmation.isConfirmation,
      user.emailConfirmation.expirationDate,
    );
    //generation a new code
    const code: any = {
      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), { hours: 1 }),
      },
    };
    //update code confirmation
    await this.usersRepositories.updateCodeConfirmation(
      user._id,
      code.emailConfirmation.confirmationCode,
      code.emailConfirmation.expirationDate,
    );
    try {
      //sending code to email
      await this.mailService.sendEmailRecoveryMessage(
        user.accountData.email,
        code.emailConfirmation.confirmationCode,
      );
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Service is unavailable. Please try again later. We need saved User',
        421,
      );
    }
    return true;
  }
}
