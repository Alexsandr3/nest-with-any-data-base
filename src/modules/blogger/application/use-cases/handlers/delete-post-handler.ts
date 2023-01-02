import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  ForbiddenExceptionMY,
  NotFoundExceptionMY
} from "../../../../../helpers/My-HttpExceptionFilter";
import { DeletePostCommand } from "../delete-post-command";
import { PostsSqlRepositories } from "../../../../posts/infrastructure/posts-sql-repositories";
import { BlogsSqlRepositories } from "../../../../blogs/infrastructure/blogs-sql.repositories";

@CommandHandler(DeletePostCommand)
export class DeletePostHandler implements ICommandHandler<DeletePostCommand> {
  constructor(
    private readonly postsRepositories: PostsSqlRepositories,
    private readonly blogsRepositories: BlogsSqlRepositories
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
