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
import { PostT } from "../../../entities/post.entity";

@Injectable()
export class CommentsTypeOrmRepositories implements ICommentRepository {
  constructor(
    @InjectRepository(CommentT)
    private readonly commentTRepository: Repository<CommentT>,
    @InjectRepository(PostT)
    private readonly postTRepository: Repository<PostT>,
    @InjectRepository(LikeComment)
    private readonly likeCommentRepository: Repository<LikeComment>
  ) {
  }

  async createCommentByIdPost(newComment: PreparationCommentForDB): Promise<CommentsViewType> {
    const { createdAt, userId, userLogin, postId, content, ownerId } = newComment;
    const post = await this.postTRepository.findOneBy({ postId: postId });
    const comment = new CommentT();
    comment.postId = postId;
    comment.ownerId = ownerId;
    comment.userId = userId;
    comment.content = content;
    comment.createdAt = createdAt;
    comment.userLogin = userLogin;
    comment.post = post
    const createdComment = await this.commentTRepository.save(comment);
    //default items
    const likesInfo = new LikesInfoViewModel(0, 0, LikeStatusType.None);
    //returning comment for View
    return new CommentsViewType(
      createdComment.commentId,
      newComment.content,
      newComment.userId,
      newComment.userLogin,
      newComment.createdAt,
      likesInfo
    );
  }

  async findCommentsById(id: string): Promise<CommentDBSQLType> {
    return this.commentTRepository
      .findOneBy({ commentId: id });
  }

  async deleteCommentsById(id: string): Promise<boolean> {
    await this.commentTRepository.manager.connection.transaction(async manager => {
      await manager.delete(CommentT, { commentId: id });
    })
      .catch((e) => {
        console.log(e);
        return false;
      });
    return true;
  }

  async updateCommentsById(id: string, content: string): Promise<boolean> {
    await this.commentTRepository.manager.connection.transaction(async manager => {
      await manager.update(CommentT,
        { commentId: id },
        { content: content }
      );
    })
      .catch((e) => {
        console.log(e);
        return null;
      });
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
    const result = await this.likeCommentRepository.findOneBy({ userId: userId, parentId: id });
    const comment: any = await this.findCommentsById(id);
    if (!result) {
      const likeComment = new LikeComment();
      likeComment.parentId = id;
      likeComment.likeStatus = likeStatus;
      likeComment.userId = userId;
      likeComment.comment = comment;
      await this.likeCommentRepository.save(likeComment);
      await this.likeCommentRepository.manager.connection.transaction(async manager => {
        await manager.update(LikeComment,
          { parentId: id, userId: userId },
          { likeStatus: likeStatus, isBanned: false }
        );
      })
        .catch((e) => {
          console.log(e);
          return null;
        });
      return true;
    } else {
      await this.likeCommentRepository.manager.connection.transaction(async manager => {
        await manager.update(LikeComment,
          { parentId: id, userId: userId },
          { likeStatus: likeStatus, isBanned: false }
        );
      })
        .catch((e) => {
          console.log(e);
          return null;
        });
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
