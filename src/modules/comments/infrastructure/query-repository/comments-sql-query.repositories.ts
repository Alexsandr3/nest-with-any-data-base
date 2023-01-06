import { Injectable } from "@nestjs/common";
import { CommentsViewType, LikesInfoViewModel } from "./types-view/comments-View-Model";
import { LikeStatusType } from "../../../posts/domain/mongo-schemas/likesPost-schema-Model";
import { NotFoundExceptionMY } from "../../../../helpers/My-HttpExceptionFilter";
import { DataSource } from "typeorm";
import { ICommentQueryRepository } from "../../interfaces/ICommentQueryRepository";

@Injectable()
export class CommentsSqlQueryRepositories implements ICommentQueryRepository {
  constructor(
    private readonly dataSource: DataSource
  ) {
  }

  async getComment(commentId: string, userId: string | null): Promise<CommentsViewType> {
    const query = `
        SELECT c."commentId",
               c.content,
               c."userId",
               u.login                                                                 AS "userLogin",
               c."createdAt",
               (SELECT count(*) AS "countLike"
                FROM "likesComment" l
                WHERE l."parentId" = c."commentId"
                  AND l."likeStatus" = 'Like'
                  AND l."isBanned" = false)                                            AS "likeCount",
               (SELECT count(*) AS "countDislike"
                FROM "likesComment" l
                WHERE l."parentId" = c."commentId"
                  AND l."likeStatus" = 'Dislike'
                  AND l."isBanned" = false)                                            AS "dislikeCount",
               COALESCE((SELECT l."likeStatus"
                         FROM "likesComment" l
                         WHERE l."parentId" = c."commentId"
                           AND l."userId" = ${userId ? `'${userId}'` : null}), 'None') AS "myStatus"

        FROM comments c
                 LEFT JOIN users u on u."userId" = c."ownerId"
        WHERE c."commentId" = '${commentId}'
          AND c."isBanned" = false
    `;
    //search comment
    const comment = await this.dataSource.query(query);
    if (!comment[0])
      throw new NotFoundExceptionMY(`Not found for commentId: ${commentId}`);
    const likesInfo = new LikesInfoViewModel(
      +comment[0].likeCount,
      +comment[0].dislikeCount,
      comment[0].myStatus
    );
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
      if (result[0]) {
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
    const queryDislike = `
        SELECT count(*)
        FROM "likesComment"
        WHERE "parentId" = '${commentId}'
          AND "likeStatus" = 'Dislike'
          AND "isBanned" = false
    `;
    const totalCountDislike = await this.dataSource.query(queryDislike);
    const countDislike = totalCountDislike[0]["count"];
    const likesInfo = new LikesInfoViewModel(
      +countLike,
      +countDislike,
      myStatus
    );
    //search comment
    const queryComment = `
        SELECT *
        FROM comments
        WHERE "commentId" = '${commentId}'
          AND "isBanned" = false
    `;
    const comment = await this.dataSource.query(queryComment);
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
