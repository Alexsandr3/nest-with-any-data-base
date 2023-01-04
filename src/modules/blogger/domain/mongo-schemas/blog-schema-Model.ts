import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema()
export class Blog {
  @Prop({ type: String })
  userId: string;
  @Prop({ type: String, required: true, minlength: 3, maxlength: 10 })
  userLogin: string;
  @Prop({ type: String, required: true, maxlength: 15, trim: true })
  name: string;
  @Prop({ type: String, required: true, maxlength: 500, trim: true })
  description: string;
  @Prop({ type: String, required: true, maxlength: 100, trim: true })
  websiteUrl: string;
  @Prop({ type: String, required: true })
  createdAt: string;
  @Prop({ type: Boolean, default: false })
  isBanned: boolean;
  @Prop({ type: String, default: null })
  banDate: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);


