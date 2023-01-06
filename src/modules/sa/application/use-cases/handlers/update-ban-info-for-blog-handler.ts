import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NotFoundExceptionMY } from "../../../../../helpers/My-HttpExceptionFilter";
import { UpdateBanInfoForBlogCommand } from "../updateBanInfoForBlogCommand";
import { Inject } from "@nestjs/common";
import { IBlogRepository, IBlogRepositoryKey } from "../../../../blogs/interfaces/IBlogRepository";
import { IPostRepository, IPostRepositoryKey } from "../../../../posts/interfaces/IPostRepository";

@CommandHandler(UpdateBanInfoForBlogCommand)
export class UpdateBanInfoForBlogHandler
  implements ICommandHandler<UpdateBanInfoForBlogCommand> {
  constructor(@Inject(IBlogRepositoryKey)
              private readonly blogsRepositories: IBlogRepository,
              @Inject(IPostRepositoryKey)
              private readonly postsRepositories: IPostRepository) {
  }

  async execute(command: UpdateBanInfoForBlogCommand): Promise<boolean> {
    const { blogId } = command;
    const { isBanned } = command.updateBanInfoForBlogModel;
    //finding blog for check existence
    const foundBlog = await this.blogsRepositories.findBlog(blogId);
    if (!foundBlog) throw new NotFoundExceptionMY(`Not found blog with id: ${blogId}`);
    //update status ban for blog
    const banStatus = await this.blogsRepositories.updateBanStatusForBlog(blogId, isBanned);
    if (!banStatus) throw new Error("not save ban Status");
    await this.postsRepositories.updateStatusBanPostForBlogger(blogId, isBanned);
    return true;
  }
}
