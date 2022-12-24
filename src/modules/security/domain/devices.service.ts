import { Injectable } from '@nestjs/common';

@Injectable()
export class DevicesService {
  constructor() {}

  /* async deleteDevices(payload: PayloadType): Promise<boolean> {
     await this.deviceRepositories.deleteDevices(payload);
     return true;
   }*/

  /*async deleteByDeviceId(deviceIdForDelete: string, deviceId: string, userId: string): Promise<boolean> {
    //find device by id from uri params
    const fondDevice = await this.deviceRepositories.findDeviceByDeviceId(deviceIdForDelete);
    if (!fondDevice) throw new NotFoundExceptionMY(`Device with id: ${deviceId} doesn't exist`);
    //find device by deviceId and userId
    const isUserDevice = await this.deviceRepositories.findByDeviceIdAndUserId(userId, deviceId);
    if (!isUserDevice) throw new ForbiddenExceptionMY(`You are not the owner of the device `);
    //find device for remove by deviceId from uri params and userId
    const deviceForDelete = await this.deviceRepositories.findByDeviceIdAndUserId(userId, deviceIdForDelete);
    if (!deviceForDelete) throw new ForbiddenExceptionMY(`You are not the owner of the device`);
    //removing device
    const isDelete = await this.deviceRepositories.deleteDeviceByDeviceId(deviceIdForDelete);
    if (!isDelete) throw new ForbiddenExceptionMY(`Something went wrong`);
    return true;
  }*/
}
