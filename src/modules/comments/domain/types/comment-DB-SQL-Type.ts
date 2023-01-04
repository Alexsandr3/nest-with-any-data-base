
export class CommentDBSQLType {
  constructor(
    public commentId: string,
    public isBanned: boolean,
    public postId: string,
    public ownerId: string,
    public content: string,
    public userId: string,
    public userLogin: string,
    public createdAt: string,
  ) {}
}
