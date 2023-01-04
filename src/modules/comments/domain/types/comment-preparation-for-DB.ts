export class PreparationCommentForDB {
  constructor(
    public isBanned: boolean,
    public postId: string,
    public ownerId: string,
    public content: string,
    public userId: string,
    public userLogin: string,
    public createdAt: string,
  ) {}
}
