import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BlogBanInfoDocument = HydratedDocument<BlogBanInfo>;

@Schema()
export class BlogBanInfo {
  @Prop({ type: String, required: true })
  blogId: string;
  @Prop({ type: String, required: true })
  ownerId: string;
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  login: string;
  @Prop({ type: String, required: true })
  email: string;
  @Prop({ type: String, required: true })
  createdAt: string;
  @Prop({ type: Boolean, default: false })
  isBanned: boolean;
  @Prop({ type: String })
  banDate: string;
  @Prop({ type: String })
  banReason: string;
}

export const BlogBanInfoSchema = SchemaFactory.createForClass(BlogBanInfo);
