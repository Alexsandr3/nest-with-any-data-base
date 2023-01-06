import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BindBlogCommand } from '../bindBlogCommand';
import { NotFoundExceptionMY } from '../../../../../helpers/My-HttpExceptionFilter';
import { Inject } from "@nestjs/common";
import { IBlogRepository, IBlogRepositoryKey } from "../../../../blogs/interfaces/IBlogRepository";

@CommandHandler(BindBlogCommand)
export class BindBlogHandler implements ICommandHandler<BindBlogCommand> {
  constructor(@Inject(IBlogRepositoryKey)
    private readonly blogsRepositories: IBlogRepository) {}

  async execute(command: BindBlogCommand): Promise<boolean> {
    const { userId, blogId } = command;
    const blog = await this.blogsRepositories.findBlog(blogId);
    if (!blog)
      throw new NotFoundExceptionMY(`not found blog with id: ${blogId}`);
    await this.blogsRepositories.updateOwnerBlog(blogId, userId);
    return true;
  }
}
