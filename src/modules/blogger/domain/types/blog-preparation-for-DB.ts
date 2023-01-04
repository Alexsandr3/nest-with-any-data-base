export class PreparationBlogForDB {
  constructor(
    public userId: string,
    public userLogin: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isBanned: boolean
  ) {
  }
}


