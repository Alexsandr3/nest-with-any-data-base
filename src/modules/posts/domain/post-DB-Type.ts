import { ObjectId } from 'mongodb';

export interface PostDBType {
  _id: ObjectId;
  isBanned: boolean;
  userId: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
}
