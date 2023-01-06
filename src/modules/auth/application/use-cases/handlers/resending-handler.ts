import { BadRequestExceptionMY } from '../../../../../helpers/My-HttpExceptionFilter';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResendingCommand } from '../resending-command';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { HttpException, Inject } from "@nestjs/common";
import { UsersService } from '../../../../users/domain/users.service';
import { MailService } from '../../../../mail/mail.service';
import { IUserRepository, IUserRepositoryKey } from "../../../../users/interfaces/IUserRepository";

@CommandHandler(ResendingCommand)
export class ResendingHandler implements ICommandHandler<ResendingCommand> {
  constructor(
    @Inject(IUserRepositoryKey)
    private readonly usersRepositories: IUserRepository,
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
    const foundData = await this.usersRepositories.findUserByUserId(user.userId)
    //check code
    await this.userService.checkUser(
      foundData.isConfirmation,
      foundData.expirationDate,
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
      user.userId,
      code.emailConfirmation.confirmationCode,
      code.emailConfirmation.expirationDate,
    );
    try {
      //sending code to email
      await this.mailService.sendEmailRecoveryMessage(
        user.email,
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
