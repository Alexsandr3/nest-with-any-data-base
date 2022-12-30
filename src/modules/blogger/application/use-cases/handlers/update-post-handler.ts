import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ForbiddenExceptionMY,
  NotFoundExceptionMY,
} from '../../../../../helpers/My-HttpExceptionFilter';
import { UpdatePostCommand } from '../update-post-command';
import { BlogsSqlRepositories } from "../../../../blogs/infrastructure/blogs-sql.repositories";
import { PostsSqlRepositories } from "../../../../posts/infrastructure/posts-sql-repositories";

@CommandHandler(UpdatePostCommand)
export class UpdatePostHandler implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private readonly postsRepositories: PostsSqlRepositories,
    private readonly blogsRepositories: BlogsSqlRepositories,
  ) {}

  async execute(command: UpdatePostCommand): Promise<boolean> {
    const { postId, blogId, userId, postInputModel } = command;
    const blog = await this.blogsRepositories.findBlog(blogId);
    if (!blog)
      throw new NotFoundExceptionMY(`Not found blog with id: ${blogId}`);
    if (userId !== blog.userId)
      throw new ForbiddenExceptionMY(`You are not the owner of the blog`);
    const result = await this.postsRepositories.updatePost(
      postId,
      postInputModel,
      blogId,
      userId,
    );
    if (!result) throw new NotFoundExceptionMY(`Not found for id:${postId}`);
    return true;
  }
}
