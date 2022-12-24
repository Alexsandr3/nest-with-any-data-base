import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Comment, CommentDocument } from "../domain/comments-schema-Model";
import { ObjectId } from "mongodb";
import { LikeStatusType } from "../../posts/domain/likesPost-schema-Model";
import {
  LikesStatus,
  LikesStatusDocument
} from "../domain/likesStatus-schema-Model";
import { PreparationCommentForDB } from "../domain/comment-preparation-for-DB";
import { CommentsViewType, LikesInfoViewModel } from "./query-repository/comments-View-Model";
import { CommentsDBType } from "../domain/comment-DB-Type";

@Injectable()
export class CommentsRepositories {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentsModel: Model<CommentDocument>,
    @InjectModel(LikesStatus.name)
    private readonly likesStatusModel: Model<LikesStatusDocument>
  ) {
  }

  async createCommentByIdPost(newComment: PreparationCommentForDB): Promise<CommentsViewType> {
    const createComment = await this.commentsModel.create(newComment);
    //default items
    const likesInfo = new LikesInfoViewModel(0, 0, LikeStatusType.None);
    //returning comment for View
    return new CommentsViewType(
      createComment._id.toString(),
      newComment.content,
      newComment.userId,
      newComment.userLogin,
      newComment.createdAt,
      likesInfo
    );
  }

  async findCommentsById(id: string): Promise<CommentsDBType> {
    return this.commentsModel.findOne({ _id: new ObjectId(id) });
  }

  async deleteCommentsById(id: string): Promise<boolean> {
    const result = await this.commentsModel.deleteOne({
      _id: new ObjectId(id)
    });
    return result.deletedCount === 1;
  }

  async updateCommentsById(id: string, content: string): Promise<boolean> {
    const result = await this.commentsModel.updateOne(
      { _id: new ObjectId(id) },
      { $set: { content: content } }
    );
    return result.matchedCount === 1;
  }

  async updateStatusBanComments(userId: string, isBanned: boolean): Promise<boolean> {
    const result = await this.commentsModel.updateMany(
      { userId: userId },
      { $set: { isBanned: isBanned } }
    );
    return result.matchedCount === 1;
  }

  async updateLikeStatusForComment(id: string, userId: string, likeStatus: LikeStatusType): Promise<boolean> {
    try {
      await this.likesStatusModel.updateOne(
        { userId: userId, parentId: id },
        { $set: { likeStatus, isBanned: false } },
        { upsert: true }
      );
      return true;
    } catch (error) {
      throw new Error(`not today - ! :-(`);
    }
  }

  async updateStatusBanLike(userId: string, isBanned: boolean): Promise<boolean> {
    const result = await this.likesStatusModel.updateMany(
      { userId: userId },
      { $set: { isBanned: isBanned } }
    );
    return result.matchedCount === 1;
  }
}
