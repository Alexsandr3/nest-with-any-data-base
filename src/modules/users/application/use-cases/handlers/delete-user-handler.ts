import { NotFoundExceptionMY } from "../../../../../helpers/My-HttpExceptionFilter";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteUserCommand } from "../delete-user-command";
import { Inject } from "@nestjs/common";
import { IUserRepository, IUserRepositoryKey } from "../../../interfaces/IUserRepository";

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @Inject(IUserRepositoryKey)
    private readonly usersRepositories: IUserRepository) {
  }

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
