export class CommentsViewType {
  constructor(
    public id: string,
    public content: string,
    public userId: string,
    public userLogin: string,
    public createdAt: string,
    public likesInfo: LikesInfoViewModel,
  ) {}
}

export class LikesInfoViewModel {
  constructor(
    public likesCount: number,
    public dislikesCount: number,
    public myStatus: string,
  ) {}
}

export class BloggerCommentsViewType {
  constructor(
    public id: string,
    public content: string,
    public createdAt: string,
    public likesInfo: LikesInfoViewModel,
    public commentatorInfo: CommentatorInfoModel,
    public postInfo: PostInfoModel,
  ) {}
}


export class CommentatorInfoModel {
  constructor(
    public userId: string,
    public userLogin: string,
  ) {}
}

export class PostInfoModel {
  constructor(
    public id: string,
    public title: string,
    public blogId: string,
    public blogName: string,
  ) {}
}