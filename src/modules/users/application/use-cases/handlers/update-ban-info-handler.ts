import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBanInfoCommand } from '../updateBanInfoCommand';
import { BadRequestExceptionMY, NotFoundExceptionMY } from "../../../../../helpers/My-HttpExceptionFilter";
import { Inject } from "@nestjs/common";
import { IUserRepository, IUserRepositoryKey } from "../../../interfaces/IUserRepository";
import { IUserQueryRepository, IUserQueryRepositoryKey } from "../../../interfaces/IUserQueryRepository";
import { IPostRepository, IPostRepositoryKey } from "../../../../posts/interfaces/IPostRepository";
import { ICommentRepository, ICommentRepositoryKey } from "../../../../comments/interfaces/ICommentRepository";

@CommandHandler(UpdateBanInfoCommand)
export class UpdateBanInfoHandler
  implements ICommandHandler<UpdateBanInfoCommand>
{
  constructor(
    @Inject(IUserQueryRepositoryKey)
    private readonly usersQueryRepositories: IUserQueryRepository,
    @Inject(IUserRepositoryKey)
    private readonly usersRepositories: IUserRepository,
    @Inject(IPostRepositoryKey)
    private readonly postsRepositories: IPostRepository,
    @Inject(ICommentRepositoryKey)
    private readonly commentsRepositories: ICommentRepository,
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
