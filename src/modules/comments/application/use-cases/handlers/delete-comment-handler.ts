import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteCommentCommand } from '../delete-comment-command';
import { CommentsRepositories } from '../../../infrastructure/comments.repositories';
import { CommentsService } from '../../../domain/comments.service';

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    private readonly commentsRepositories: CommentsRepositories,
    private readonly commentsService: CommentsService,
  ) {}

  async execute(command: DeleteCommentCommand): Promise<boolean> {
    const { id } = command;
    const { userId } = command;
    //finding and checking comment
    await this.commentsService.findComment(id, userId);
    //delete a comment from DB
    const result = await this.commentsRepositories.deleteCommentsById(id);
    if (!result) throw new Error(`not today`);
    return true;
  }
}
