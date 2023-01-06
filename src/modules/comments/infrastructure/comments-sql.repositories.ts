import { Injectable } from "@nestjs/common";
import { LikeStatusType } from "../../posts/domain/mongo-schemas/likesPost-schema-Model";
import { PreparationCommentForDB } from "../domain/types/comment-preparation-for-DB";
import { CommentsViewType, LikesInfoViewModel } from "./query-repository/types-view/comments-View-Model";
import { DataSource } from "typeorm";
import { CommentDBSQLType } from "../domain/types/comment-DB-SQL-Type";
import { ICommentRepository } from "../interfaces/ICommentRepository";

@Injectable()
export class CommentsSqlRepositories implements ICommentRepository {
  constructor(
    private readonly dataSource: DataSource
  ) {
  }

  async createCommentByIdPost(newComment: PreparationCommentForDB): Promise<CommentsViewType> {
    const { createdAt, userId, userLogin, postId, content, ownerId } = newComment;
    const query =
      `
          INSERT INTO comments ("postId", "ownerId", "userId", "content",
                                "createdAt", "userLogin")
          VALUES ('${postId}', '${ownerId}', '${userId}', '${content}',
                  '${createdAt}', '${userLogin}') RETURNING "commentId","content", "userId", "userLogin", "createdAt"
      `;
    const comment = await this.dataSource.query(query);
    //default items
    const likesInfo = new LikesInfoViewModel(0, 0, LikeStatusType.None);
    //returning comment for View
    return new CommentsViewType(
      comment[0].commentId,
      newComment.content,
      newComment.userId,
      newComment.userLogin,
      newComment.createdAt,
      likesInfo
    );
  }

  async findCommentsById(id: string): Promise<CommentDBSQLType> {
    const query = `
        SELECT *
        FROM comments
        WHERE "commentId" = '${id}'
    `;
    const comment = await this.dataSource.query(query);
    return comment[0];
    // return this.commentsModel.findOne({ _id: new ObjectId(id) });
  }

  async deleteCommentsById(id: string): Promise<boolean> {
    const query = `
        DELETE
        FROM "comments"
        WHERE "commentId" = '${id}'
    `;
    await this.dataSource.query(query);
    return true;
  }

  async updateCommentsById(id: string, content: string): Promise<boolean> {
    const query = `
        UPDATE "comments"
        SET "content" = '${content}'
        WHERE "commentId" = '${id}'
    `;
    await this.dataSource.query(query);
    return true;
  }

  async updateStatusBanComments(userId: string, isBanned: boolean): Promise<boolean> {
    const query = `
        UPDATE "comments"
        SET "isBanned" = ${isBanned}
        WHERE "userId" = '${userId}'
    `;
    await this.dataSource.query(query);
    return true;
  }

  async updateLikeStatusForComment(id: string, userId: string, likeStatus: LikeStatusType): Promise<boolean> {
    const queryFind = `
        SELECT *
        FROM "likesComment"
        WHERE "userId" = '${userId}'
          AND "parentId" = '${id}'
    `;
    const result = await this.dataSource.query(queryFind);
    if (!result[0]) {
      const query = `
          INSERT INTO "likesComment" ("parentId", "likeStatus", "userId")
          VALUES ('${id}', '${likeStatus}', '${userId}');
      `;
      await this.dataSource.query(query);
      const queryUpdate = `
          UPDATE "likesComment"
          SET "likeStatus" = '${likeStatus}',
              "isBanned"   = false
          WHERE "userId" = '${userId}'
            AND "parentId" = '${id}'
      `;
      const res = await this.dataSource.query(queryUpdate);
      if (!res[1]) return null;
      return true;
    } else {
      const queryUpdate = `
          UPDATE "likesComment"
          SET "likeStatus" = '${likeStatus}',
              "isBanned"   = false
          WHERE "userId" = '${userId}'
            AND "parentId" = '${id}'
      `;
      const res = await this.dataSource.query(queryUpdate);
      if (!res[1]) return null;
      return true;
    }
  }

  async updateStatusBanLike(userId: string, isBanned: boolean): Promise<boolean> {
    const query = `
        UPDATE "likesComment"
        SET "isBanned" = ${isBanned}
        WHERE "userId" = '${userId}'
    `;
    await this.dataSource.query(query);
    return true;
  }
}
