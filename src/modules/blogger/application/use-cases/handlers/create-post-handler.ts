import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreatePostCommand } from "../create-post-command";
import { PostViewModel } from "../../../../posts/infrastructure/query-repositories/post-View-Model";
import { PreparationPostForDB } from "../../../../posts/domain/post-preparation-for-DB";
import {
  ForbiddenExceptionMY,
  NotFoundExceptionMY
} from "../../../../../helpers/My-HttpExceptionFilter";
import { BlogsSqlRepositories } from "../../../../blogs/infrastructure/blogs-sql.repositories";
import { PostsSqlRepositories } from "../../../../posts/infrastructure/posts-sql-repositories";
import { PostsSqlQueryRepositories } from "../../../../posts/infrastructure/query-repositories/posts-sql-query.reposit";

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly blogsRepositories: BlogsSqlRepositories,
    private readonly postsRepositories: PostsSqlRepositories,
    private readonly postsQueryRepositories: PostsSqlQueryRepositories
  ) {
  }

  async execute(command: CreatePostCommand): Promise<PostViewModel> {
    const { userId, blogId } = command;
    const { title, shortDescription, content } = command.postInputModel;
    const blog = await this.blogsRepositories.findBlog(blogId);
    if (!blog)
      throw new NotFoundExceptionMY(`Not found blog with id: ${blogId}`);
    if (userId !== blog.userId)
      throw new ForbiddenExceptionMY(`You are not the owner of the blog`);
    if (blog.isBanned === true) throw new NotFoundExceptionMY(`Not found data for id: ${blogId}`);
    //preparation Post for save in DB
    const newPost = new PreparationPostForDB(
      false,
      userId,
      title,
      shortDescription,
      content,
      blogId,
      blog.name,
      new Date().toISOString()
    );
    const createdPostId = await this.postsRepositories.createPost(newPost);
    return await this.postsQueryRepositories.createPostForView(createdPostId);
  }
}
