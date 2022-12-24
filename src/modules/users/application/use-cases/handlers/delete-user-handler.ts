import { UsersRepositories } from '../../../infrastructure/users-repositories';
import { NotFoundExceptionMY } from '../../../../../helpers/My-HttpExceptionFilter';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteUserCommand } from '../delete-user-command';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly usersRepositories: UsersRepositories) {}

  async execute(command: DeleteUserCommand): Promise<boolean> {
    const { userId } = command;
    const user = await this.usersRepositories.findUserByIdWithMapped(userId);
    if (!user) {
      throw new NotFoundExceptionMY(`Not found for id: ${userId}`);
    }
    await this.usersRepositories.deleteUser(userId);
    return true;
  }
}
