import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { LeanDocument, Model } from "mongoose";
import { Device, DeviceDocument } from "../../domain/mongo-schemas/device-schema-Model";
import { DeviceViewModel } from "./types-view/device-View-Model";
import { IDeviceQueryRepository } from "../../interfaces/IDeviceQueryRepository";

@Injectable()
export class DeviceQueryRepositories implements IDeviceQueryRepository {
  constructor(
    @InjectModel(Device.name)
    private readonly deviceModel: Model<DeviceDocument>
  ) {
  }

  private deviceForView(object: LeanDocument<DeviceDocument>): DeviceViewModel {
    return new DeviceViewModel(
      object.ip,
      object.title,
      object.lastActiveDate,
      object.deviceId
    );
  }

  async findDevices(userId: string): Promise<DeviceViewModel[]> {
    const devices = await this.deviceModel.find({ userId: userId }).lean();
    if (!devices) {
      throw new Error("server all");
    } else {
      return devices.map((device) => this.deviceForView(device));
    }
  }
}
