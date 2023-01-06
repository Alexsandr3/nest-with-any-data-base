import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  ForbiddenExceptionMY,
  NotFoundExceptionMY
} from "../../../../../helpers/My-HttpExceptionFilter";
import { DeletePostCommand } from "../delete-post-command";
import { Inject } from "@nestjs/common";
import { IPostRepository, IPostRepositoryKey } from "../../../../posts/interfaces/IPostRepository";
import { IBlogRepository, IBlogRepositoryKey } from "../../../../blogs/interfaces/IBlogRepository";

@CommandHandler(DeletePostCommand)
export class DeletePostHandler implements ICommandHandler<DeletePostCommand> {
  constructor(
    @Inject(IPostRepositoryKey)
    private readonly postsRepositories: IPostRepository,
    @Inject(IBlogRepositoryKey)
    private readonly blogsRepositories: IBlogRepository
  ) {
  }

  async execute(command: DeletePostCommand): Promise<boolean> {
    const { postId, blogId, userId } = command;
    const blog = await this.blogsRepositories.findBlog(blogId);
    if (!blog)
      throw new NotFoundExceptionMY(`Not found blog with id: ${blogId}`);
    if (userId !== blog.userId)
      throw new ForbiddenExceptionMY(`You are not the owner of the blog`);
    const result = await this.postsRepositories.deletePost(postId, userId);
    if (!result) throw new NotFoundExceptionMY(`Not found for id: ${postId}`);
    return true;
  }
}
