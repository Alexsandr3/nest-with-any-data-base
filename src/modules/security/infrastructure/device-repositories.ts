import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Device, DeviceDocument } from "../domain/device-schema-Model";
import { PreparationDeviceForDB } from "../domain/device-preparation-for-DB";
import { DeviceDBType } from "../domain/device-DB-Type";

@Injectable()
export class DeviceRepositories {
  constructor(
    @InjectModel(Device.name)
    private readonly deviceModel: Model<DeviceDocument>
  ) {
  }

  async createDevice(device: PreparationDeviceForDB) {
    return await this.deviceModel.create(device);
  }

  async updateDateDevice(
    userId: string,
    deviceId: string,
    dateCreateToken: string,
    dateExpiredToken: string,
    dateCreatedOldToken: string
  ): Promise<boolean> {
    const result = await this.deviceModel.updateOne(
      {
        $and: [
          { userId: { $eq: userId } },
          { deviceId: { $eq: deviceId } },
          { lastActiveDate: { $eq: dateCreatedOldToken } }
        ]
      },
      {
        $set: {
          lastActiveDate: dateCreateToken,
          expiredDate: dateExpiredToken
        }
      }
    );
    return result.modifiedCount === 1;
  }

  async findDeviceForDelete(
    userId: string,
    deviceId: string,
    dateCreatedToken: string
  ): Promise<DeviceDBType> {
    return this.deviceModel.findOne({
      $and: [
        { userId: { $eq: userId } },
        { deviceId: { $eq: deviceId } },
        { lastActiveDate: { $eq: dateCreatedToken } }
      ]
    });
  }

  async deleteDevice(userId: string, deviceId: string): Promise<boolean> {
    const result = await this.deviceModel.deleteOne({
      $and: [{ userId: { $eq: userId } }, { deviceId: { $eq: deviceId } }]
    });
    return result.deletedCount === 1;
  }

  async deleteDevices(userId: string, deviceId: string): Promise<boolean> {
    const result = await this.deviceModel.deleteMany({
      userId: userId,
      deviceId: { $ne: deviceId }
    });
    return result.deletedCount === 1;
  }

  async deleteDevicesForBannedUser(userId: string): Promise<boolean> {
    const result = await this.deviceModel.deleteMany({ userId: userId });
    return result.deletedCount === 1;
  }

  async findByDeviceIdAndUserId(userId: string, deviceId: string): Promise<DeviceDBType> {
    return this.deviceModel.findOne({ userId, deviceId });
  }

  async deleteDeviceByDeviceId(deviceId: string): Promise<boolean> {
    const result = await this.deviceModel.deleteMany({ deviceId: deviceId });
    return result.deletedCount === 1;
  }

  async findDeviceForValid(
    userId: string,
    deviceId: string,
    iat: number
  ): Promise<DeviceDBType> {
    const dateCreateToken = new Date(iat * 1000).toISOString();
    const device = await this.deviceModel.findOne({
      $and: [
        { userId: userId },
        { deviceId: deviceId },
        { lastActiveDate: dateCreateToken }
      ]
    });
    if (!device) {
      return null;
    } else {
      return device;
    }
  }

  async findDeviceByDeviceId(deviceId: string): Promise<DeviceDBType> {
    const device = await this.deviceModel.findOne({ deviceId: deviceId });
    if (!device) {
      return null;
    } else {
      return device;
    }
  }
}
