import { Injectable } from "@nestjs/common";
import { DeviceViewModel } from "./device-View-Model";
import { DataSource } from "typeorm";

@Injectable()
export class DeviceSqlQueryRepositories {
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
