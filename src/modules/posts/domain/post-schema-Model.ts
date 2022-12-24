import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({ type: Boolean, default: false })
  isBanned: boolean;
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true, maxlength: 30, trim: true })
  title: string;
  @Prop({ type: String, required: true, maxlength: 100 })
  shortDescription: string;
  @Prop({ type: String, required: true, maxlength: 1000 })
  content: string;
  @Prop({ type: String, required: true })
  blogId: string;
  @Prop({ type: String, required: true })
  blogName: string;
  @Prop({ type: String, required: true })
  createdAt: string;
}
export const PostSchema = SchemaFactory.createForClass(Post);
