import { Inject, Injectable } from "@nestjs/common";
import {
  ForbiddenExceptionMY,
  NotFoundExceptionMY
} from "../../../helpers/My-HttpExceptionFilter";
import { ICommentRepository, ICommentRepositoryKey } from "../interfaces/ICommentRepository";

@Injectable()
export class CommentsService {
  constructor(@Inject(ICommentRepositoryKey)
              private readonly commentsRepositories: ICommentRepository) {
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
