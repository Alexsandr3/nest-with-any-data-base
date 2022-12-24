import { Injectable } from "@nestjs/common";
import { CommentsRepositories } from "../infrastructure/comments.repositories";
import {
  ForbiddenExceptionMY,
  NotFoundExceptionMY
} from "../../../helpers/My-HttpExceptionFilter";

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepositories: CommentsRepositories) {
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
