import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BindBlogCommand } from '../bindBlogCommand';
import { NotFoundExceptionMY } from '../../../../../helpers/My-HttpExceptionFilter';
import { BlogsSqlRepositories } from "../../../../blogs/infrastructure/blogs-sql.repositories";

@CommandHandler(BindBlogCommand)
export class BindBlogHandler implements ICommandHandler<BindBlogCommand> {
  constructor(private readonly blogsRepositories: BlogsSqlRepositories) {}

  async execute(command: BindBlogCommand): Promise<boolean> {
    const { userId, blogId } = command;
    const blog = await this.blogsRepositories.findBlog(blogId);
    if (!blog)
      throw new NotFoundExceptionMY(`not found blog with id: ${blogId}`);
    await this.blogsRepositories.updateOwnerBlog(blogId, userId);
    return true;
  }
}
