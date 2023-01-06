import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteCommentCommand } from "../delete-comment-command";
import { CommentsService } from "../../../domain/comments.service";
import { ICommentRepository, ICommentRepositoryKey } from "../../../interfaces/ICommentRepository";
import { Inject } from "@nestjs/common";

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler
  implements ICommandHandler<DeleteCommentCommand> {
  constructor(
    @Inject(ICommentRepositoryKey)
    private readonly commentsRepositories: ICommentRepository,
    private readonly commentsService: CommentsService
  ) {
  }

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
