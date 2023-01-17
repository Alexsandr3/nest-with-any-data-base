import { Injectable } from "@nestjs/common";
import { CommentsViewType, LikesInfoViewModel } from "./types-view/comments-View-Model";
import { LikeStatusType } from "../../../posts/domain/mongo-schemas/likesPost-schema-Model";
import { NotFoundExceptionMY } from "../../../../helpers/My-HttpExceptionFilter";
import { Repository } from "typeorm";
import { ICommentQueryRepository } from "../../interfaces/ICommentQueryRepository";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentT } from "../../../../entities/comment.entity";
import { LikeComment } from "../../../../entities/likeComment.entity";

@Injectable()
export class CommentsTypeOrmQueryRepositories implements ICommentQueryRepository {
  constructor(
    @InjectRepository(CommentT)
    private readonly commentTRepository: Repository<CommentT>,
    @InjectRepository(LikeComment)
    private readonly likeCommentRepository: Repository<LikeComment>
  ) {
  }

  async getComment(commentId: string, userId: string | null): Promise<CommentsViewType> {
    let myStatus: string = LikeStatusType.None;
    if (userId) {
      const result = await this.likeCommentRepository.findOneBy({
        userId: userId,
        parentId: commentId
      });
      if (result) {
        myStatus = result.likeStatus;
      }
    }
    const [comment, countLike, countDislike] = await Promise.all([
      this.commentTRepository
        .findOneBy({ commentId: commentId, isBanned: false }),
      this.likeCommentRepository
        .count({ where: { parentId: commentId, likeStatus: "Like", isBanned: false } }),
      this.likeCommentRepository
        .count({ where: { parentId: commentId, likeStatus: "Dislike", isBanned: false } })
    ]);
    //search comment
    if (!comment)
      throw new NotFoundExceptionMY(`Not found for commentId: ${commentId}`);
    const likesInfo = new LikesInfoViewModel(
      countLike,
      countDislike,
      myStatus
    );
    //returning comment for View
    return new CommentsViewType(
      comment.commentId,
      comment.content,
      comment.userId,
      comment.userLogin,
      comment.createdAt,
      likesInfo
    );
  }

}
