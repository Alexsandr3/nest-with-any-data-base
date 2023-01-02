import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsService } from "../../../domain/comments.service";
import { UpdateCommentCommand } from "../update-comment-command";
import { CommentsSqlRepositories } from "../../../infrastructure/comments-sql.repositories";

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler
  implements ICommandHandler<UpdateCommentCommand> {
  constructor(
    private readonly commentsRepositories: CommentsSqlRepositories,
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
