import { Injectable } from "@nestjs/common";
import { PreparationDeviceForDB } from "../domain/types/device-preparation-for-DB";
import { Repository } from "typeorm";
import { IDeviceRepository } from "../interfaces/IDeviceRepository";
import { InjectRepository } from "@nestjs/typeorm";
import { DeviceT } from "../../../entities/device.entity";

@Injectable()
export class DeviceTypeOrmRepositories implements IDeviceRepository {
  constructor(
    @InjectRepository(DeviceT)
    private readonly deviceTRepository: Repository<DeviceT>
  ) {
  }

  async createDevice(device: PreparationDeviceForDB) {
    const { userId, deviceId, lastActiveDate, expiredDate, ip, title } = device;
    const session = new DeviceT();
    session.deviceId = deviceId;
    session.userId = userId;
    session.ip = ip;
    session.title = title;
    session.lastActiveDate = lastActiveDate;
    session.expiredDate = expiredDate;
    return await this.deviceTRepository.save(session);


    // const query = `
    //     INSERT
    //     INTO devices ("deviceId", "userId", "ip", "title", "lastActiveDate", "expiredDate")
    //     VALUES ('${deviceId}', '${userId}', '${ip}', '${title}', '${lastActiveDate}', '${expiredDate}');
    // `;
    // return await this.deviceTRepository.query(query);
  }

  async updateDateDevice(userId: string, deviceId: string, dateCreateToken: string, dateExpiredToken: string, dateCreatedOldToken: string
  ): Promise<boolean> {
    await this.deviceTRepository.manager.connection.transaction(async manager => {
      await manager.update(DeviceT,
        { userId: userId, deviceId: deviceId, lastActiveDate: dateCreateToken },
        { lastActiveDate: dateCreateToken, expiredDate: dateExpiredToken }
      );
    })
      .catch((e) => {
        console.log(e);
      });
    return true;
  }

  async findDeviceForDelete(userId: string, deviceId: string, dateCreatedToken: string
  )/*: Promise<DeviceDBType>*/ {


    return await this.deviceTRepository
      .findOne({
        where: {
          userId: userId,
          deviceId: deviceId,
          lastActiveDate: dateCreatedToken
        }
      });
  }

  async deleteDevice(userId: string, deviceId: string): Promise<boolean> {
    await this.deviceTRepository
      .delete({ userId: userId, deviceId: deviceId })
      .catch((e) => {
        console.log(e);
      });
    return true;
  }

  async deleteDevices(userId: string, deviceId: string): Promise<boolean> {
    await this.deviceTRepository.manager.connection.transaction(async manager => {
      await manager.createQueryBuilder()
        .delete()
        .from(DeviceT)
        .where("userId = :id AND deviceId != :id2", { id: userId, id2: deviceId })
        .execute();
    })
      .catch((e) => {
        console.log(e);
      });
    return true;
  }

  async deleteDevicesForBannedUser(userId: string): Promise<boolean> {
    await this.deviceTRepository.delete({ userId: userId })
      .catch((e) => {
        console.log(e);
      });
    return true;
  }

  async findByDeviceIdAndUserId(userId: string, deviceId: string)/*: Promise<DeviceDBType> */ {
    // const query = `
    //     SELECT *
    //     FROM devices
    //     WHERE "userId" = '${userId}'
    //       AND "deviceId" = '${deviceId}'
    // `;
    return await this.deviceTRepository
      .findOneBy({ userId: userId, deviceId: deviceId });
  }

  async deleteDeviceByDeviceId(deviceId: string): Promise<boolean> {
    await this.deviceTRepository.manager.connection.transaction(async manager => {
      await manager.createQueryBuilder()
        .delete()
        .from(DeviceT)
        .where("deviceId = :id", { id: deviceId })
        .execute();
    })
      .catch((e) => {
        console.log(e);
      });
    return true;
  }

  async findDeviceForValid(
    userId: string,
    deviceId: string,
    iat: number
  )/*: Promise<DeviceDBType>*/ {
    const dateCreateToken = new Date(iat * 1000).toISOString();
    const devices = await this.deviceTRepository
      .findOneBy({
        userId: userId,
        deviceId: deviceId,
        lastActiveDate: dateCreateToken
      });
    if (!devices) {
      return null;
    } else {
      return devices;
    }
  }

  async findDeviceByDeviceId(deviceId: string)/*: Promise<DeviceDBType>*/ {
    const devices = await this.deviceTRepository
      .findOneBy({ deviceId: deviceId });

    if (!devices) {
      return null;
    } else {
      return devices;
    }
  }
}
