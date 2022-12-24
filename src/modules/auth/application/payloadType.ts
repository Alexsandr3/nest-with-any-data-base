export class PayloadType {
  constructor(
    public userId: string,
    public deviceId: string,
    public iat: number,
    public exp: number,
  ) {}
}
