export class UsersViewType {
  constructor(
    public id: string,
    public login: string,
    public email: string,
    public createdAt: string,
    public banInfo: BanInfoType,
  ) {}
}

export class BanInfoType {
  constructor(
    public isBanned: boolean,
    public banDate: string,
    public banReason: string,
  ) {}
}


export class UsersForBanBlogViewType {
  constructor(
    public id: string,
    public login: string,
    public banInfo: BanInfoType,
  ) {}
}
