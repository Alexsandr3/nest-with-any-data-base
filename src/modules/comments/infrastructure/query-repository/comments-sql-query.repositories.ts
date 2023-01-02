import { Injectable } from "@nestjs/common";
import { CommentsViewType, LikesInfoViewModel } from "./comments-View-Model";
import { LikeStatusType } from "../../../posts/domain/likesPost-schema-Model";
import { NotFoundExceptionMY } from "../../../../helpers/My-HttpExceptionFilter";
import { DataSource } from "typeorm";

@Injectable()
export class CommentsSqlQueryRepositories {
  constructor(
    private readonly dataSource: DataSource,
  ) {
  }

  async findComment(commentId: string, userId: string | null): Promise<CommentsViewType> {
    //finding like status by userId and commentId
    let myStatus: string = LikeStatusType.None;
    if (userId) {
      const query = `
          SELECT *
          FROM "likesComment"
          WHERE "userId" = '${userId}'
            AND "parentId" = '${commentId}'
            AND "isBanned" = false
      `;
      const result = await this.dataSource.query(query);
      // result = await this.likesStatusModel.findOne({
      //   userId: userId,
      //   parentId: commentId,
      //   isBanned: false
      // });
      if (result) {
        myStatus = result[0].likeStatus;
      }
    }
    const queryLike = `
        SELECT count(*)
        FROM "likesComment"
        WHERE "parentId" = '${commentId}'
          AND "likeStatus" = 'Like'
          AND "isBanned" = false
    `;
    const totalCountLike = await this.dataSource.query(queryLike);
    const countLike = totalCountLike[0]["count"];
    // const totalCountLike = await this.likesStatusModel.countDocuments({
    //   parentId: commentId,
    //   likeStatus: "Like",
    //   isBanned: false
    // });
    const queryDislike = `
        SELECT count(*)
        FROM "likesComment"
        WHERE "parentId" = '${commentId}'
          AND "likeStatus" = 'Dislike'
          AND "isBanned" = false
    `;
    const totalCountDislike = await this.dataSource.query(queryDislike);
    const countDislike = totalCountDislike[0]["count"];
    // const totalCountDislike = await this.likesStatusModel.countDocuments({
    //   parentId: commentId,
    //   likeStatus: "Dislike",
    //   isBanned: false
    // });
    const likesInfo = new LikesInfoViewModel(
      +countLike,
      +countDislike,
      myStatus
    );
    //search comment
    const queryComment = `
        SELECT *
        FROM comments
        WHERE "commentId" = '${commentId}' AND "isBanned" = false
    `
    const comment = await this.dataSource.query(queryComment)
    // const comment = await this.commentsModel.findOne({
    //   _id: new ObjectId(commentId),
    //   isBanned: false
    // });
    if (!comment[0])
      throw new NotFoundExceptionMY(`Not found for commentId: ${commentId}`);
    //returning comment for View
    return new CommentsViewType(
      comment[0].commentId,
      comment[0].content,
      comment[0].userId,
      comment[0].userLogin,
      comment[0].createdAt,
      likesInfo
    );
  }
}
