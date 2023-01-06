import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateCommentCommand } from "../create-comment-command";
import { CommentsViewType } from "../../../../comments/infrastructure/query-repository/types-view/comments-View-Model";
import {
  ForbiddenExceptionMY,
  NotFoundExceptionMY,
} from "../../../../../helpers/My-HttpExceptionFilter";
import { PreparationCommentForDB } from "../../../../comments/domain/types/comment-preparation-for-DB";
import { Inject } from "@nestjs/common";
import { IPostRepository, IPostRepositoryKey } from "../../../interfaces/IPostRepository";
import { IBlogRepository, IBlogRepositoryKey } from "../../../../blogs/interfaces/IBlogRepository";
import { ICommentRepository, ICommentRepositoryKey } from "../../../../comments/interfaces/ICommentRepository";
import { IUserQueryRepository, IUserQueryRepositoryKey } from "../../../../users/interfaces/IUserQueryRepository";

@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler
  implements ICommandHandler<CreateCommentCommand> {
  constructor(
    @Inject(IPostRepositoryKey)
    private readonly postsRepositories: IPostRepository,
    @Inject(IBlogRepositoryKey)
    private readonly blogsRepositories: IBlogRepository,
    @Inject(ICommentRepositoryKey)
    private readonly commentsRepositories: ICommentRepository,
    @Inject(IUserQueryRepositoryKey)
    private readonly usersQueryRepositories: IUserQueryRepository
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
      post.userId, //user owner post
      content,
      userId, //user owner comment
      user.login,
      new Date().toISOString()
    );
    return await this.commentsRepositories.createCommentByIdPost(newComment);
  }
}
