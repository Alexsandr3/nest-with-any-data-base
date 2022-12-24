import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LikeStatusType } from '../../posts/domain/likesPost-schema-Model';

export type LikesStatusDocument = HydratedDocument<LikesStatus>;

@Schema()
export class LikesStatus {
  @Prop({ type: Boolean, default: false })
  isBanned: boolean;
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  parentId: string;
  @Prop({ type: String, default: 'None', enum: LikeStatusType })
  likeStatus: string;
}
export const LikesStatusSchema = SchemaFactory.createForClass(LikesStatus);
