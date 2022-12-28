import { NotFoundExceptionMY } from '../../../../../helpers/My-HttpExceptionFilter';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteUserCommand } from '../delete-user-command';
import { UsersSqlRepositories } from "../../../infrastructure/users-sql-repositories";

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly usersSqlRepositories: UsersSqlRepositories) {}

  async execute(command: DeleteUserCommand): Promise<boolean> {
    const { userId } = command;
    const user = await this.usersSqlRepositories.findUserByIdWithMapped(userId);
    if (!user) {
      throw new NotFoundExceptionMY(`Not found for id: ${userId}`);
    }
    await this.usersSqlRepositories.deleteUser(userId);
    return true;
  }
}
