import { ObjectId } from 'mongodb';

export interface BlogsDBType {
  _id: ObjectId;
  userId: string;
  userLogin: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isBanned: boolean;
  banDate: string;
}
