import { getConfiguration } from "../../../config/configuration";
import { DeviceViewModel } from "../infrastructure/query-repository/types-view/device-View-Model";
import { DeviceSqlQueryRepositories } from "../infrastructure/query-repository/device-sql-query.repositories";
import { DeviceQueryRepositories } from "../infrastructure/query-repository/device-query.repositories";
import { DeviceTypeOrmQueryRepositories } from "../infrastructure/query-repository/device-type-orm-query.repositories";

export interface IDeviceQueryRepository {
  findDevices(userId: string): Promise<DeviceViewModel[]>;

}

export const IDeviceQueryRepositoryKey = "IDeviceQueryRepository";


export const DeviceQueryRepository = () => {
  const dbType = getConfiguration().database.DB_TYPE;
  switch (dbType) {
    case "MongoDB":
      return {
        provide: IDeviceQueryRepositoryKey,
        useClass: DeviceQueryRepositories
      };
    case "RawSQL":
      return {
        provide: IDeviceQueryRepositoryKey,
        useClass: DeviceSqlQueryRepositories
      };
    case "TypeOrm":
      return {
        provide: IDeviceQueryRepositoryKey,
        useClass: DeviceTypeOrmQueryRepositories
      };
    default:
      return {
        provide: IDeviceQueryRepositoryKey,
        useClass: DeviceSqlQueryRepositories
      };
  }
};