import { UsersRepositories } from '../../../infrastructure/users-repositories';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBanInfoCommand } from '../updateBanInfoCommand';
import { UsersQueryRepositories } from '../../../infrastructure/query-reposirory/users-query.reposit';
import {
  BadRequestExceptionMY,
  NotFoundExceptionMY,
} from '../../../../../helpers/My-HttpExceptionFilter';
import { PostsRepositories } from '../../../../posts/infrastructure/posts-repositories';
import { CommentsRepositories } from '../../../../comments/infrastructure/comments.repositories';

@CommandHandler(UpdateBanInfoCommand)
export class UpdateBanInfoHandler
  implements ICommandHandler<UpdateBanInfoCommand>
{
  constructor(
    private readonly usersRepositories: UsersRepositories,
    private readonly usersQueryRepositories: UsersQueryRepositories,
    private readonly postsRepositories: PostsRepositories,
    private readonly commentsRepositories: CommentsRepositories,
  ) {}

  async execute(command: UpdateBanInfoCommand): Promise<boolean> {
    const { userId } = command;
    const { isBanned, banReason } = command.updateBanInfoModel;
    const user = await this.usersQueryRepositories.findUser(userId);
    if (!user) throw new NotFoundExceptionMY(`Not found `);
    if (isBanned === false) {
      const banDate = null;
      const banReason = null;
      //update status ban user
      const banInfo = await this.usersRepositories.updateBanInfoUser(
        userId,
        isBanned,
        banDate,
        banReason,
      );
      if (!banInfo)
        throw new BadRequestExceptionMY({
          message: `New data not received for update`,
          field: `database`,
        });
      //update status ban posts for User
      await this.postsRepositories.updateStatusBanPostForUser(userId, isBanned);
      //update status ban likes post
      await this.postsRepositories.updateStatusBanLikePost(userId, isBanned);
      //update status ban comments
      await this.commentsRepositories.updateStatusBanComments(userId, isBanned);
      //update status ban likes comments
      await this.commentsRepositories.updateStatusBanLike(userId, isBanned);
    } else {
      const banDate = new Date().toISOString();
      //update status ban posts
      await this.usersRepositories.updateBanInfoUser(
        userId,
        isBanned,
        banDate,
        banReason,
      );
      //update status ban likes post
      await this.postsRepositories.updateStatusBanPostForUser(userId, isBanned);
      //update status ban likes post
      await this.postsRepositories.updateStatusBanLikePost(userId, isBanned);
      //update status ban comments
      await this.commentsRepositories.updateStatusBanComments(userId, isBanned);
      //update status ban likes comments
      await this.commentsRepositories.updateStatusBanLike(userId, isBanned);
    }
    return true;
  }
}
