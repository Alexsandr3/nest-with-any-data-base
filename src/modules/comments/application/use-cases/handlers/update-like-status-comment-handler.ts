import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundExceptionMY } from '../../../../../helpers/My-HttpExceptionFilter';
import { UpdateLikeStatusCommentCommand } from '../update-like-status-comment-command';
import { Inject } from "@nestjs/common";
import { ICommentRepository, ICommentRepositoryKey } from "../../../interfaces/ICommentRepository";

@CommandHandler(UpdateLikeStatusCommentCommand)
export class UpdateLikeStatusCommentHandler
  implements ICommandHandler<UpdateLikeStatusCommentCommand>
{
  constructor( @Inject(ICommentRepositoryKey)
               private readonly commentsRepositories: ICommentRepository,) {}

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
