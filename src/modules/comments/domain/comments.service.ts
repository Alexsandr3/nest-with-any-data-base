import { Injectable } from "@nestjs/common";
import {
  ForbiddenExceptionMY,
  NotFoundExceptionMY
} from "../../../helpers/My-HttpExceptionFilter";
import { CommentsSqlRepositories } from "../infrastructure/comments-sql.repositories";

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepositories: CommentsSqlRepositories) {
  }

  public async findComment(id: string, userId: string): Promise<boolean> {
    //finding comment by id from uri params
    const comment = await this.commentsRepositories.findCommentsById(id);
    if (!comment) throw new NotFoundExceptionMY(`Not found content`);
    if (comment.userId !== userId)
      throw new ForbiddenExceptionMY(`You are not the owner of the comment`);
    return true;
  }

}
