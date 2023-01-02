import { Injectable } from "@nestjs/common";
import { LikeStatusType } from "../../posts/domain/likesPost-schema-Model";
import { PreparationCommentForDB } from "../domain/comment-preparation-for-DB";
import { CommentsViewType, LikesInfoViewModel } from "./query-repository/comments-View-Model";
import { DataSource } from "typeorm";
import { CommentDBSQLType } from "../domain/comment-DB-SQL-Type";

@Injectable()
export class CommentsSqlRepositories {
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
        FROM commnets
        WHERE "commentId" = '${id}'
    `;
    await this.dataSource.query(query);
    return true;
    // const result = await this.commentsModel.deleteOne({
    //   _id: new ObjectId(id)
    // });
    // return result.deletedCount === 1;
  }

  async updateCommentsById(id: string, content: string): Promise<boolean> {
    const query = `
        UPDATE comments
        SET "content" = '${content}'
        WHERE "commnetId" = '${id}'
    `;
    await this.dataSource.query(query);
    // const result = await this.commentsModel.updateOne(
    //   { _id: new ObjectId(id) },
    //   { $set: { content: content } }
    // );
    // return result.matchedCount === 1;
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
    //
    // const result = await this.commentsModel.updateMany(
    //   { userId: userId },
    //   { $set: { isBanned: isBanned } }
    // );
    // return result.matchedCount === 1;
  }

  async updateLikeStatusForComment(id: string, userId: string, likeStatus: LikeStatusType): Promise<boolean> {
    const query = `
        INSERT INTO "likesComment" ("parentId", "likeStatus", "userId")
        VALUES ('${id}', '${likeStatus}', '${userId}');
    `;
    const queryUpdate = `
        UPDATE "likesComment"
        SET "likeStatus" = '${likeStatus}',
            "isBanned"   = false
        WHERE "userId" = '${userId}'
          AND "parentId" = '${id}'
    `;

    await this.dataSource.query(query);
    await this.dataSource.query(queryUpdate);
    return true;

    // try {
    //   await this.likesStatusModel.updateOne(
    //     { userId: userId, parentId: id },
    //     { $set: { likeStatus, isBanned: false } },
    //     { upsert: true }
    //   );
    //   return true;
    // } catch (error) {
    //   throw new Error(`not today - ! :-(`);
    // }
  }

  async updateStatusBanLike(userId: string, isBanned: boolean): Promise<boolean> {
    const query = `
        UPDATE "likesPost"
        SET "isBanned" = ${isBanned}
        WHERE "userId" = '${userId}'
    `;
    await this.dataSource.query(query);
    return true;
    // const result = await this.likesStatusModel.updateMany(
    //   { userId: userId },
    //   { $set: { isBanned: isBanned } }
    // );
    // return result.matchedCount === 1;
  }
}
