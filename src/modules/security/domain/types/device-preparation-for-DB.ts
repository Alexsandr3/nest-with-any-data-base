import { randomUUID } from 'crypto';

export class CompanyDto {
  companyId;
  deviceId = randomUUID();
  constructor(user: any) {
    this.companyId = user._id;
  }
}

export class PreparationDeviceForDB {
  constructor(
    public userId: string,
    public ip: string,
    public title: string,
    public lastActiveDate: string,
    public expiredDate: string,
    public deviceId: string,
  ) {}
}

/*

export class PayloadDTO {
  companyId: string;
  deviceId: string;
  iat: string;
  exp: string;
  constructor(model: PayloadType) {
    this.companyId = model.companyId;
    this.deviceId = model.deviceId;
    this.iat = (new Date(model.iat * 1000)).toISOString();
    this.exp = (new Date(model.exp * 1000)).toISOString();
  }
}
*/
