import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateBanUserForCurrentBlogCommand } from "../update-ban-User-For-Current-Blog-command";
import {
  BadRequestExceptionMY,
  ForbiddenExceptionMY,
  NotFoundExceptionMY
} from "../../../../../helpers/My-HttpExceptionFilter";
import { BanUserForBlogPreparationForDB } from "../../../domain/ban-user-for-blog-preparation-for-DB";
import { UsersSqlQueryRepositories } from "../../../../users/infrastructure/query-reposirory/users-sql-query.reposit";
import { BlogsSqlRepositories } from "../../../../blogs/infrastructure/blogs-sql.repositories";

@CommandHandler(UpdateBanUserForCurrentBlogCommand)
export class UpdateBanUserForCurrentBlogHandler
  implements ICommandHandler<UpdateBanUserForCurrentBlogCommand> {
  constructor(private readonly usersQueryRepositories: UsersSqlQueryRepositories,
              private readonly blogsRepositories: BlogsSqlRepositories) {
  }

  async execute(command: UpdateBanUserForCurrentBlogCommand): Promise<boolean> {
    const { id, userId } = command;
    const { isBanned, banReason, blogId } = command.banUserForCurrentBlogInputModel;
    const foundUser = await this.usersQueryRepositories.findUser(id);
    if (!foundUser) throw new NotFoundExceptionMY(`Not found user with id: ${id}`);
    const foundBlog = await this.blogsRepositories.findBlog(blogId)
    if (!foundBlog) throw new NotFoundExceptionMY(`Not found blog with id: ${id}`);
    if (userId !== foundBlog.userId)
      throw new ForbiddenExceptionMY(`You are not the owner of the blog`);
    const banStatus = new BanUserForBlogPreparationForDB(
      foundBlog.blogId,
      userId,
      foundUser.id,
      foundUser.login,
      foundUser.email,
      foundUser.createdAt,
      false,
      null,
      null
    );
    await this.blogsRepositories.createBanStatus(banStatus)
    if (isBanned === false) {
      const banDate = null;
      const banReason = null;
      const banStatus = new BanUserForBlogPreparationForDB(
        blogId,
        userId,
        id,
        foundUser.login,
        foundUser.email,
        foundUser.createdAt,
        isBanned,
        banDate,
        banReason
      );
      const banInfo = await this.blogsRepositories.updateBanStatus(banStatus);
      if (!banInfo) throw new BadRequestExceptionMY({
          message: `New data not received for update`,
          field: `database` });
    } else {
      const banDate = new Date().toISOString();
      const banStatus = new BanUserForBlogPreparationForDB(
        blogId,
        userId,
        id,
        foundUser.login,
        foundUser.email,
        foundUser.createdAt,
        isBanned,
        banDate,
        banReason
      );

      const banInfoId = await this.blogsRepositories.updateBanStatus(banStatus);
      if (!banInfoId)
        throw new BadRequestExceptionMY({
          message: `New data not received for create`,
          field: `database`
        });
    }
    return true;
  }
}


