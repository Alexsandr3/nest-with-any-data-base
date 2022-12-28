import { UsersRepositories } from '../../../infrastructure/users-repositories';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBanInfoCommand } from '../updateBanInfoCommand';
import { UsersQueryRepositories } from '../../../infrastructure/query-reposirory/users-query.reposit';
import { PostsRepositories } from '../../../../posts/infrastructure/posts-repositories';
import { CommentsRepositories } from '../../../../comments/infrastructure/comments.repositories';
import { UsersSqlQueryRepositories } from "../../../infrastructure/query-reposirory/users-sql-query.reposit";
import { UsersSqlRepositories } from "../../../infrastructure/users-sql-repositories";

@CommandHandler(UpdateBanInfoCommand)
export class UpdateBanInfoHandler
  implements ICommandHandler<UpdateBanInfoCommand>
{
  constructor(
    private readonly usersRepositories: UsersRepositories,
    private readonly usersQueryRepositories: UsersQueryRepositories,
    private readonly usersSqlQueryRepositories: UsersSqlQueryRepositories,
    private readonly usersSqlRepositories: UsersSqlRepositories,
    private readonly postsRepositories: PostsRepositories,
    private readonly commentsRepositories: CommentsRepositories,
  ) {}

  async execute(command: UpdateBanInfoCommand): Promise<boolean> {
    const { userId } = command;
    const { isBanned, banReason } = command.updateBanInfoModel;
    // const user = await this.usersSqlQueryRepositories.findUser(userId);
    // if (!user) throw new NotFoundExceptionMY(`Not found `);
    if (isBanned === false) {
      const banDate = null;
      const banReason = null;
      //update status ban user
      const banInfo = await this.usersSqlRepositories.updateBanInfoUser(
        userId,
        isBanned,
        banDate,
        banReason,
      );
      // if (!banInfo)
      //   throw new BadRequestExceptionMY({
      //     message: `New data not received for update`,
      //     field: `database`,
      //   });
      // //update status ban posts for User
      // await this.postsRepositories.updateStatusBanPostForUser(userId, isBanned);
      // //update status ban likes post
      // await this.postsRepositories.updateStatusBanLikePost(userId, isBanned);
      // //update status ban comments
      // await this.commentsRepositories.updateStatusBanComments(userId, isBanned);
      // //update status ban likes comments
      // await this.commentsRepositories.updateStatusBanLike(userId, isBanned);
    } else {
      const banDate = new Date().toISOString();
      //update status ban posts
      const banInfo = await this.usersSqlRepositories.updateBanInfoUser(
        userId,
        isBanned,
        banDate,
        banReason,
      );
      // if (!banInfo)
      //   throw new BadRequestExceptionMY({
      //     message: `New data not received for update`,
      //     field: `database`,
      //   });
      // //update status ban likes post
      // await this.postsRepositories.updateStatusBanPostForUser(userId, isBanned);
      // //update status ban likes post
      // await this.postsRepositories.updateStatusBanLikePost(userId, isBanned);
      // //update status ban comments
      // await this.commentsRepositories.updateStatusBanComments(userId, isBanned);
      // //update status ban likes comments
      // await this.commentsRepositories.updateStatusBanLike(userId, isBanned);
    }
    return true;
  }
}
