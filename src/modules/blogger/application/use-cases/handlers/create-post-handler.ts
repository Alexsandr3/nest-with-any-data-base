import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostCommand } from '../create-post-command';
import { PostViewModel } from '../../../../posts/infrastructure/query-repositories/post-View-Model';
import { PreparationPostForDB } from '../../../../posts/domain/post-preparation-for-DB';
import { PostsRepositories } from '../../../../posts/infrastructure/posts-repositories';
import { PostsQueryRepositories } from '../../../../posts/infrastructure/query-repositories/posts-query.reposit';
import {
  ForbiddenExceptionMY,
  NotFoundExceptionMY,
} from '../../../../../helpers/My-HttpExceptionFilter';
import { BlogsRepositories } from '../../../../blogs/infrastructure/blogs.repositories';

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly blogsRepositories: BlogsRepositories,
    private readonly postsRepositories: PostsRepositories,
    private readonly postsQueryRepositories: PostsQueryRepositories,
  ) {}

  async execute(command: CreatePostCommand): Promise<PostViewModel> {
    const { userId, blogId } = command;
    const { title, shortDescription, content } = command.postInputModel;
    const blog = await this.blogsRepositories.findBlog(blogId);
    if (!blog)
      throw new NotFoundExceptionMY(`Not found blog with id: ${blogId}`);
    if (userId !== blog.userId)
      throw new ForbiddenExceptionMY(`You are not the owner of the blog`);
    if (blog.isBanned === true) throw new NotFoundExceptionMY(`Not found data for id: ${blogId}`)
    //preparation Post for save in DB
    const newPost = new PreparationPostForDB(
      false,
      userId,
      title,
      shortDescription,
      content,
      blogId,
      blog.name,
      new Date().toISOString(),
    );
    const createdPost = await this.postsRepositories.createPost(newPost);
    return await this.postsQueryRepositories.createPostForView(createdPost);
  }
}
