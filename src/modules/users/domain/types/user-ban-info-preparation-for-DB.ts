export class PreparationUserBanInfoForDB {
  constructor(
    public isBanned: boolean,
    public banDate: string,
    public banReason: string,
  ) {}
}
