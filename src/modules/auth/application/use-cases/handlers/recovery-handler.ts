import { BadRequestExceptionMY } from '../../../../../helpers/My-HttpExceptionFilter';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { HttpException } from '@nestjs/common';
import { UsersRepositories } from '../../../../users/infrastructure/users-repositories';
import { UsersService } from '../../../../users/domain/users.service';
import { MailService } from '../../../../mail/mail.service';
import { RecoveryCommand } from '../recovery-command';
import { UsersSqlRepositories } from "../../../../users/infrastructure/users-sql-repositories";

@CommandHandler(RecoveryCommand)
export class RecoveryHandler implements ICommandHandler<RecoveryCommand> {
  constructor(
    private readonly usersRepositories: UsersRepositories,
    private readonly usersSqlRepositories: UsersSqlRepositories,
    private readonly userService: UsersService,
    private readonly mailService: MailService,
  ) {}

  async execute(command: RecoveryCommand): Promise<boolean> {
    const { email } = command.emailInputModel;
    //search user by login or email
    const user = await this.usersSqlRepositories.findByLoginOrEmail(email);
    if (!user)
      throw new BadRequestExceptionMY({
        message: `${email} has invalid`,
        field: 'email',
      });
    const foundData = await this.usersSqlRepositories.findUserByUserId(user.userId)
    //check code confirmation
    await this.userService.checkUser(
      foundData.isConfirmation,
      foundData.expirationDate,
    );
    //generate new code
    const code: any = {
      emailRecovery: {
        recoveryCode: randomUUID(),
        expirationDate: add(new Date(), { hours: 1 }),
      },
    };
    //updating new code in DB
    await this.usersSqlRepositories.updateCodeRecovery(
      user.userId,
      code.emailRecovery.recoveryCode,
      code.emailRecovery.expirationDate,
    );
    try {
      await this.mailService.sendPasswordRecoveryMessage(
        user.email,
        code.emailRecovery.recoveryCode,
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
