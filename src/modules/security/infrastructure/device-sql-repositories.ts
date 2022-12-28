import { Injectable } from "@nestjs/common";
import { PreparationDeviceForDB } from "../domain/device-preparation-for-DB";
import { DeviceDBType } from "../domain/device-DB-Type";
import { DataSource } from "typeorm";

@Injectable()
export class DeviceSqlRepositories {
  constructor(
    private readonly dataSource: DataSource
  ) {
  }

  async createDevice(device: PreparationDeviceForDB) {
    const { userId, deviceId, lastActiveDate, expiredDate, ip, title } = device;
    const query = `
        INSERT
        INTO devices ("deviceId", "user_id", "ip", "title", "lastActiveDate", "expiredDate")
        VALUES ('${deviceId}', '${userId}', '${ip}', '${title}', '${lastActiveDate}', '${expiredDate}');
    `;
    return await this.dataSource.query(query);
  }

  async updateDateDevice(
    userId: string,
    deviceId: string,
    dateCreateToken: string,
    dateExpiredToken: string,
    dateCreatedOldToken: string
  ): Promise<boolean> {

    const query = `
        UPDATE devices
        SET "lastActiveDate"='${dateCreateToken}',
            "expiredDate"='${dateExpiredToken}'
        WHERE user_id = '${userId}'
          AND "deviceId" = '${deviceId}'
          AND "lastActiveDate" = '${dateCreatedOldToken}'
    `;
    const res = await this.dataSource.query(query);
    if (res[1] === 0) throw new Error("not today");
    return;
  }

  async findDeviceForDelete(
    userId: string,
    deviceId: string,
    dateCreatedToken: string
  ): Promise<DeviceDBType> {
    const query = `
        SELECT *
        FROM devices
        WHERE user_id = '${userId}'
          AND "deviceId" = '${deviceId}'
          AND "lastActiveDate" = '${dateCreatedToken}'
    `;
    const devices = await this.dataSource.query(query)
    return devices[0]
  }

  async deleteDevice(userId: string, deviceId: string): Promise<boolean> {
    const query = `
        SELECT *
        FROM devices
        WHERE user_id = '${userId}'
          AND "deviceId" = '${deviceId}'
    `;
    const devices = await this.dataSource.query(query)
    if (devices[1] === 0) throw new Error(`not today`)
    return true
  }

  async deleteDevices(userId: string, deviceId: string): Promise<boolean> {
    const query = `
        DELETE
        FROM devices
        WHERE user_id = '${userId}' AND "deviceId" != '${deviceId}'
    `
    const res = await this.dataSource.query(query)
    if(res[1] > 0) throw new Error(`not otday`)
    return true
  }

  async deleteDevicesForBannedUser(userId: string): Promise<boolean> {
    const query = `;
    DELETE;
    FROM;
    devices;
    WHERE;
    user_id = "${userId}"
      `;
    const res = await this.dataSource.query(query);
    console.log("res", res);
    return res;

    // const result = await this.deviceModel.deleteMany({ userId: userId });
    // return result.deletedCount === 1;
  }

  async findByDeviceIdAndUserId(userId: string, deviceId: string): Promise<DeviceDBType> {
    const query = `
        SELECT *
        FROM devices
        WHERE user_id = '${userId}' AND "deviceId" = '${deviceId}'
    `
    const devices = await this.dataSource.query(query)
    return devices[0]
  }

  async deleteDeviceByDeviceId(deviceId: string): Promise<boolean> {
    const query = `
        DELETE
        FROM devices
        WHERE "deviceId" = '${deviceId}'
    `
    const devices = await this.dataSource.query(query)
    if (devices[1] === 0) throw new Error(`not today`)
    return true
  }

  async findDeviceForValid(
    userId: string,
    deviceId: string,
    iat: number
  ): Promise<DeviceDBType> {
    const dateCreateToken = new Date(iat * 1000).toISOString();
    const query = `
        SELECT *
        FROM devices
        WHERE user_id = '${userId}'
          AND "deviceId" = '${deviceId}'
          AND "lastActiveDate" = '${dateCreateToken}'
    `;
    const devices = await this.dataSource.query(query);
    if (!devices[0]) {
      return null;
    } else {
      return devices[0];
    }
  }

  async findDeviceByDeviceId(deviceId: string): Promise<DeviceDBType> {
    const query = `
        SELECT *
        FROM devices
        WHERE "deviceId" = '${deviceId}'
    `
    const devices = await this.dataSource.query(query)
    if (!devices[0]){
      return null;
    } else {
      return devices[0];
    }
  }
}
