import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  ForbiddenExceptionMY,
  NotFoundExceptionMY
} from "../../../../../helpers/My-HttpExceptionFilter";
import { UpdateBlogCommand } from "../update-blog-command";
import { BlogsSqlRepositories } from "../../../../blogs/infrastructure/blogs-sql.repositories";

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogHandler implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogsRepositories: BlogsSqlRepositories) {
  }

  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const { blogInputModel, blogId, userId } = command;
    const blog = await this.blogsRepositories.findBlog(blogId);
    if (!blog)
      throw new NotFoundExceptionMY(`Not found blog with id: ${blogId}`);
    if (userId !== blog.userId)
      throw new ForbiddenExceptionMY(`You are not the owner of the blog`);
    const result = await this.blogsRepositories.updateBlog(
      blogId,
      userId,
      blogInputModel
    );
    if (!result) throw new NotFoundExceptionMY(`Not found for id: ${blogId}`);
    return true;
  }
}
