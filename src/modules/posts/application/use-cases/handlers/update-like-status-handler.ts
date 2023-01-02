import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NotFoundExceptionMY } from "../../../../../helpers/My-HttpExceptionFilter";
import { UpdateLikeStatusCommand } from "../update-like-status-command";
import { PostsSqlRepositories } from "../../../infrastructure/posts-sql-repositories";
import { UsersSqlQueryRepositories } from "../../../../users/infrastructure/query-reposirory/users-sql-query.reposit";

@CommandHandler(UpdateLikeStatusCommand)
export class UpdateLikeStatusHandler
  implements ICommandHandler<UpdateLikeStatusCommand> {
  constructor(
    private readonly postsRepositories: PostsSqlRepositories,
    private readonly usersQueryRepositories: UsersSqlQueryRepositories
  ) {
  }

  async execute(command: UpdateLikeStatusCommand): Promise<boolean> {
    const { id, userId } = command;
    const { likeStatus } = command.updateLikeStatusInputModel;
    //finding post by id from uri params
    const post = await this.postsRepositories.findPost(id);
    if (!post) throw new NotFoundExceptionMY(`Not found for id: ${id}`);
    //finding user by userId for update like status
    const user = await this.usersQueryRepositories.findUser(userId);
    //update like status
    const result = await this.postsRepositories.updateLikeStatusPost(
      id,
      userId,
      likeStatus,
      user.login
    );
    if (!result) throw new NotFoundExceptionMY(`Like doesn't exists`);
    return true;
  }
}
