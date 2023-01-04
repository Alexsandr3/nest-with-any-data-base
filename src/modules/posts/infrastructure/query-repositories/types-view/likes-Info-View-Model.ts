export class ExtendedLikesInfoViewModel {
  constructor(
    public likesCount: number,
    public dislikesCount: number,
    public myStatus: string,
    public newestLikes: Array<LikeDetailsViewModel>,
  ) {}
}

export class LikeDetailsViewModel {
  constructor(
    public addedAt: string,
    public userId: string,
    public login: string,
  ) {}
}
