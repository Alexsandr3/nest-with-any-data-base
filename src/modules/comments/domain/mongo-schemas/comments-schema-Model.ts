import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
  @Prop({ type: Boolean, default: false })
  isBanned: boolean;
  @Prop({ type: String, required: true })
  postId: string;
  @Prop({ type: String, required: true })
  ownerId: string;
  @Prop({ type: String, required: true, minlength: 20, maxlength: 300 })
  content: string;
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  userLogin: string;
  @Prop({ type: String, required: true })
  createdAt: string;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);
