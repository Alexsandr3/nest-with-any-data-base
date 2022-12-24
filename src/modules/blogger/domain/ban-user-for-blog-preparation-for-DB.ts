import { ObjectId } from "mongodb";

export class BanUserForBlogPreparationForDB {
  constructor(
    public blogId: string,
    public ownerId: string,
    public userId: string,
    public login: string,
    public email: string,
    public createdAt: string,
    public isBanned: boolean,
    public banDate: string,
    public banReason: string,
  ) {}
}



export class BanStatusBlogDBType {
  constructor(
    public _id: ObjectId,
    public blogId: string,
    public ownerId: string,
    public userId: string,
    public login: string,
    public email: string,
    public createdAt: string,
    public isBanned: boolean,
    public banDate: string,
    public banReason: string,
  ) {}
}
