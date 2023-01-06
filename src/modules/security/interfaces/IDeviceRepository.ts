import { getConfiguration } from "../../../config/configuration";
import { PreparationDeviceForDB } from "../domain/types/device-preparation-for-DB";
import { DeviceDBType } from "../domain/types/device-DB-Type";
import { DeviceSqlRepositories } from "../infrastructure/device-sql-repositories";
import { DeviceRepositories } from "../infrastructure/device-repositories";

export interface IDeviceRepository {
  createDevice(device: PreparationDeviceForDB);

  updateDateDevice(
    userId: string,
    deviceId: string,
    dateCreateToken: string,
    dateExpiredToken: string,
    dateCreatedOldToken: string
  ): Promise<boolean>;

  findDeviceForDelete(
    userId: string,
    deviceId: string,
    dateCreatedToken: string
  ): Promise<DeviceDBType>;

  deleteDevice(userId: string, deviceId: string): Promise<boolean>;

  deleteDevices(userId: string, deviceId: string): Promise<boolean>;

  deleteDevicesForBannedUser(userId: string): Promise<boolean>;

  findByDeviceIdAndUserId(userId: string, deviceId: string): Promise<DeviceDBType>;

  deleteDeviceByDeviceId(deviceId: string): Promise<boolean>;

  findDeviceForValid(userId: string, deviceId: string, iat: number): Promise<DeviceDBType>;

  findDeviceByDeviceId(deviceId: string): Promise<DeviceDBType>;

}

export const IDeviceRepositoryKey = "IDeviceRepository";


export const DeviceRepository = () => {
  const dbType = getConfiguration().database.DB_TYPE;
  switch (dbType) {
    case "MongoDB":
      return {
        provide: IDeviceRepositoryKey,
        useClass: DeviceRepositories
      };
    case "RawSQL":
      return {
        provide: IDeviceRepositoryKey,
        useClass: DeviceSqlRepositories
      };
    default:
      return {
        provide: IDeviceRepositoryKey,
        useClass: DeviceSqlRepositories
      };
  }
};