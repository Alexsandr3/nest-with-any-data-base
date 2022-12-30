import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteBlogCommand } from '../delete-blog-command';
import {
  ForbiddenExceptionMY,
  NotFoundExceptionMY,
} from '../../../../../helpers/My-HttpExceptionFilter';
import { BlogsSqlRepositories } from "../../../../blogs/infrastructure/blogs-sql.repositories";

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogHandler implements ICommandHandler<DeleteBlogCommand> {
  constructor(private readonly blogsRepositories: BlogsSqlRepositories) {}

  async execute(command: DeleteBlogCommand): Promise<boolean> {
    const { blogId, userId } = command;
    const blog = await this.blogsRepositories.findBlog(blogId);
    if (!blog)
      throw new NotFoundExceptionMY(`Not found blog with id: ${blogId}`);
    if (userId !== blog.userId)
      throw new ForbiddenExceptionMY(`You are not the owner of the blog`);
    const result = await this.blogsRepositories.deleteBlog(blogId, userId);
    if (!result) throw new NotFoundExceptionMY(`Not found for id: ${blogId}`);
    return true;
  }
}
