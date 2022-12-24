import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepositories } from "../../../infrastructure/posts-repositories";
import { CreateCommentCommand } from "../create-comment-command";
import { CommentsViewType } from "../../../../comments/infrastructure/query-repository/comments-View-Model";
import {
  ForbiddenExceptionMY,
  NotFoundExceptionMY,
} from "../../../../../helpers/My-HttpExceptionFilter";
import { PreparationCommentForDB } from "../../../../comments/domain/comment-preparation-for-DB";
import { UsersQueryRepositories } from "../../../../users/infrastructure/query-reposirory/users-query.reposit";
import { CommentsRepositories } from "../../../../comments/infrastructure/comments.repositories";
import { BlogsRepositories } from "../../../../blogs/infrastructure/blogs.repositories";

@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler
  implements ICommandHandler<CreateCommentCommand> {
  constructor(
    private readonly postsRepositories: PostsRepositories,
    private readonly blogsRepositories: BlogsRepositories,
    private readonly commentsRepositories: CommentsRepositories,
    private readonly usersQueryRepositories: UsersQueryRepositories
  ) {
  }

  async execute(command: CreateCommentCommand): Promise<CommentsViewType> {
    const { content } = command.inputCommentModel;
    const { id } = command;
    const { userId } = command;
    //find post for create comment
    const post = await this.postsRepositories.findPost(id);
    if (!post) throw new NotFoundExceptionMY(`Not found for id: ${id}`);
    const user = await this.usersQueryRepositories.findUser(userId);
    //check status ban user
    const statusBan = await this.blogsRepositories.findStatusBan(userId, post.blogId);
    if (statusBan && statusBan.isBanned === true) {
      throw new ForbiddenExceptionMY(`For user comment banned`);
    }
    //preparation comment for save in DB
    const newComment = new PreparationCommentForDB(
      false,
      post._id.toString(),
      post.userId,
      content,
      userId,
      user.login,
      new Date().toISOString()
    );
    return await this.commentsRepositories.createCommentByIdPost(newComment);
  }
}
