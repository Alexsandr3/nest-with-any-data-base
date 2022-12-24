import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepositories } from '../../../infrastructure/comments.repositories';
import { CommentsService } from '../../../domain/comments.service';
import { UpdateCommentCommand } from '../update-comment-command';

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    private readonly commentsRepositories: CommentsRepositories,
    private readonly commentsService: CommentsService,
  ) {}

  async execute(command: UpdateCommentCommand) {
    const { id, userId } = command;
    const { content } = command.updateCommentInputModel;
    //finding and checking comment
    await this.commentsService.findComment(id, userId);
    //updating a comment in DB
    const result = await this.commentsRepositories.updateCommentsById(
      id,
      content,
    );
    if (!result) throw new Error(`not today`);
    return true;
  }
}
