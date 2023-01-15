import { Injectable } from "@nestjs/common";
import { DeviceViewModel } from "./types-view/device-View-Model";
import { Repository } from "typeorm";
import { IDeviceQueryRepository } from "../../interfaces/IDeviceQueryRepository";
import { InjectRepository } from "@nestjs/typeorm";
import { DeviceT } from "../../../../entities/device.entity";

@Injectable()
export class DeviceTypeOrmQueryRepositories implements IDeviceQueryRepository {
  constructor(
    @InjectRepository(DeviceT)
    private readonly deviceTRepository: Repository<DeviceT>
  ) {
  }

  async findDevices(userId: string): Promise<DeviceViewModel[]> {
    return await this.deviceTRepository
      .find({
        select: ["ip", "title", "lastActiveDate", "deviceId"],
        where: { userId: userId }
      });
  }
}
