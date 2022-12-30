


export class BannedBlogUsersDBSQL {
  constructor(
    public id: string,
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
