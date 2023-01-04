export class PreparationPostForDB {
  constructor(
    public isBanned: boolean,
    public userId: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
  ) {}
}
