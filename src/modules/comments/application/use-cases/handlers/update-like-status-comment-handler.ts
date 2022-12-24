import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepositories } from '../../../infrastructure/comments.repositories';
import { NotFoundExceptionMY } from '../../../../../helpers/My-HttpExceptionFilter';
import { UpdateLikeStatusCommentCommand } from '../update-like-status-comment-command';

@CommandHandler(UpdateLikeStatusCommentCommand)
export class UpdateLikeStatusCommentHandler
  implements ICommandHandler<UpdateLikeStatusCommentCommand>
{
  constructor(private readonly commentsRepositories: CommentsRepositories) {}

  async execute(command: UpdateLikeStatusCommentCommand): Promise<boolean> {
    const { id, userId } = command;
    const { likeStatus } = command.updateLikeStatusInputModel;
    //finding comment by id from uri params
    const comment = await this.commentsRepositories.findCommentsById(id);
    if (!comment)
      throw new NotFoundExceptionMY(`comment with specified id doesn't exists`);
    //update a like status for comment
    return this.commentsRepositories.updateLikeStatusForComment(
      id,
      userId,
      likeStatus,
    );
  }
}
