import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsService } from "../../../domain/comments.service";
import { UpdateCommentCommand } from "../update-comment-command";
import { Inject } from "@nestjs/common";
import { ICommentRepository, ICommentRepositoryKey } from "../../../interfaces/ICommentRepository";

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler
  implements ICommandHandler<UpdateCommentCommand> {
  constructor(
    @Inject(ICommentRepositoryKey)
    private readonly commentsRepositories: ICommentRepository,
    private readonly commentsService: CommentsService
  ) {
  }

  async execute(command: UpdateCommentCommand) {
    const { id, userId } = command;
    const { content } = command.updateCommentInputModel;
    //finding and checking comment
    await this.commentsService.findComment(id, userId);
    //updating a comment in DB
    const result = await this.commentsRepositories.updateCommentsById(
      id,
      content
    );
    if (!result) throw new Error(`not today`);
    return true;
  }
}
