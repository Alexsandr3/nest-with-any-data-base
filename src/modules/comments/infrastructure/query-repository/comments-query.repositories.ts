import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../../domain/comments-schema-Model';
import { ObjectId } from 'mongodb';
import { CommentsViewType, LikesInfoViewModel } from './comments-View-Model';
import { LikeStatusType } from '../../../posts/domain/likesPost-schema-Model';
import { NotFoundExceptionMY } from '../../../../helpers/My-HttpExceptionFilter';
import {
  LikesStatus,
  LikesStatusDocument,
} from '../../domain/likesStatus-schema-Model';

@Injectable()
export class CommentsQueryRepositories {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentsModel: Model<CommentDocument>,
    @InjectModel(LikesStatus.name)
    private readonly likesStatusModel: Model<LikesStatusDocument>,
  ) {}

  async findComment(commentId: string, userId: string | null,): Promise<CommentsViewType> {
    //finding like status by userId and commentId
    let myStatus: string = LikeStatusType.None;
    if (userId) {
      const result = await this.likesStatusModel.findOne({
        userId: userId,
        parentId: commentId,
        isBanned: false,
      });
      if (result) {
        myStatus = result.likeStatus;
      }
    }
    const totalCountLike = await this.likesStatusModel.countDocuments({
      parentId: commentId,
      likeStatus: 'Like',
      isBanned: false,
    });
    const totalCountDislike = await this.likesStatusModel.countDocuments({
      parentId: commentId,
      likeStatus: 'Dislike',
      isBanned: false,
    });
    const likesInfo = new LikesInfoViewModel(
      totalCountLike,
      totalCountDislike,
      myStatus,
    );
    //search comment
    const comment = await this.commentsModel.findOne({
      _id: new ObjectId(commentId),
      isBanned: false,
    });
    if (!comment)
      throw new NotFoundExceptionMY(`Not found for commentId: ${commentId}`);
    //returning comment for View
    return new CommentsViewType(
      comment._id?.toString(),
      comment.content,
      comment.userId,
      comment.userLogin,
      comment.createdAt,
      likesInfo,
    );
  }
}
