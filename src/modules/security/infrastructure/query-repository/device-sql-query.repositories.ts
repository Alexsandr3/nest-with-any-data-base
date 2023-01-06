import { Injectable } from "@nestjs/common";
import { DeviceViewModel } from "./types-view/device-View-Model";
import { DataSource } from "typeorm";
import { IDeviceQueryRepository } from "../../interfaces/IDeviceQueryRepository";

@Injectable()
export class DeviceSqlQueryRepositories implements IDeviceQueryRepository {
  constructor(
    private readonly dataSource: DataSource
  ) {
  }

  async findDevices(userId: string): Promise<DeviceViewModel[]> {
    const query = `
        SELECT ip, title, "lastActiveDate", "deviceId"
        FROM devices
        WHERE "userId" = '${userId}'
    `;
    return await this.dataSource.query(query);
  }
}
