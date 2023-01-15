import { Injectable } from "@nestjs/common";
import { LikeStatusType } from "../../posts/domain/mongo-schemas/likesPost-schema-Model";
import { PreparationCommentForDB } from "../domain/types/comment-preparation-for-DB";
import { CommentsViewType, LikesInfoViewModel } from "./query-repository/types-view/comments-View-Model";
import { Repository } from "typeorm";
import { CommentDBSQLType } from "../domain/types/comment-DB-SQL-Type";
import { ICommentRepository } from "../interfaces/ICommentRepository";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentT } from "../../../entities/comment.entity";
import { LikeComment } from "../../../entities/likeComment.entity";

@Injectable()
export class CommentsTypeOrmRepositories implements ICommentRepository {
  constructor(
    @InjectRepository(CommentT)
    private readonly commentTRepository: Repository<CommentT>,
    @InjectRepository(LikeComment)
    private readonly likeCommentRepository: Repository<LikeComment>
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
    const comment = await this.commentTRepository.query(query);
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
    const comment = await this.commentTRepository.query(query);
    return comment[0];
    // return this.commentsModel.findOne({ _id: new ObjectId(id) });
  }

  async deleteCommentsById(id: string): Promise<boolean> {
    const query = `
        DELETE
        FROM "comments"
        WHERE "commentId" = '${id}'
    `;
    await this.commentTRepository.query(query);
    return true;
  }

  async updateCommentsById(id: string, content: string): Promise<boolean> {
    const query = `
        UPDATE "comments"
        SET "content" = '${content}'
        WHERE "commentId" = '${id}'
    `;
    await this.commentTRepository.query(query);
    return true;
  }

  async updateStatusBanComments(userId: string, isBanned: boolean): Promise<boolean> {
    await this.commentTRepository.manager.connection.transaction(async manager => {
      await manager.update(CommentT,
        { userId: userId },
        { isBanned: isBanned }
      );
    })
      .catch((e) => {
        console.log(e);
      });
    return true;
  }

  async updateLikeStatusForComment(id: string, userId: string, likeStatus: LikeStatusType): Promise<boolean> {
    const queryFind = `
        SELECT *
        FROM "likesComment"
        WHERE "userId" = '${userId}'
          AND "parentId" = '${id}'
    `;
    const result = await this.commentTRepository.query(queryFind);
    if (!result[0]) {
      const query = `
          INSERT INTO "likesComment" ("parentId", "likeStatus", "userId")
          VALUES ('${id}', '${likeStatus}', '${userId}');
      `;
      await this.commentTRepository.query(query);
      const queryUpdate = `
          UPDATE "likesComment"
          SET "likeStatus" = '${likeStatus}',
              "isBanned"   = false
          WHERE "userId" = '${userId}'
            AND "parentId" = '${id}'
      `;
      const res = await this.commentTRepository.query(queryUpdate);
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
      const res = await this.commentTRepository.query(queryUpdate);
      if (!res[1]) return null;
      return true;
    }
  }

  async updateStatusBanLike(userId: string, isBanned: boolean): Promise<boolean> {
    await this.likeCommentRepository.manager.connection.transaction(async manager => {
      await manager.update(LikeComment,
        { userId: userId },
        { isBanned: isBanned }
      );
    })
      .catch((e) => {
        console.log(e);
      });
    return true;
  }
}
