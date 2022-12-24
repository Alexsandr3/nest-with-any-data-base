import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum LikeStatusType {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export type LikesPostsStatusDocument = HydratedDocument<LikesPostsStatus>;

@Schema()
export class LikesPostsStatus {
  @Prop({ type: Boolean, default: false })
  isBanned: boolean;
  @Prop({ type: String, required: true })
  addedAt: string;
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  parentId: string;
  @Prop({ type: String, required: true })
  login: string;
  @Prop({ type: String, default: 'None', enum: LikeStatusType })
  likeStatus: string;
}
export const LikesPostsStatusSchema =
  SchemaFactory.createForClass(LikesPostsStatus);
