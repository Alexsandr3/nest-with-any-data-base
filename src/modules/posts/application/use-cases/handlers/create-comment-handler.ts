import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateCommentCommand } from "../create-comment-command";
import { CommentsViewType } from "../../../../comments/infrastructure/query-repository/comments-View-Model";
import {
  ForbiddenExceptionMY,
  NotFoundExceptionMY,
} from "../../../../../helpers/My-HttpExceptionFilter";
import { PreparationCommentForDB } from "../../../../comments/domain/comment-preparation-for-DB";
import { BlogsSqlRepositories } from "../../../../blogs/infrastructure/blogs-sql.repositories";
import { PostsSqlRepositories } from "../../../infrastructure/posts-sql-repositories";
import { UsersSqlQueryRepositories } from "../../../../users/infrastructure/query-reposirory/users-sql-query.reposit";
import { CommentsSqlRepositories } from "../../../../comments/infrastructure/comments-sql.repositories";

@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler
  implements ICommandHandler<CreateCommentCommand> {
  constructor(
    private readonly postsRepositories: PostsSqlRepositories,
    private readonly blogsRepositories: BlogsSqlRepositories,
    private readonly commentsRepositories: CommentsSqlRepositories,
    private readonly usersQueryRepositories: UsersSqlQueryRepositories
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
      post.postId,
      post.userId,
      content,
      userId,
      user.login,
      new Date().toISOString()
    );
    return await this.commentsRepositories.createCommentByIdPost(newComment);
  }
}
