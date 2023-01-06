import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DevicesService } from "./domain/devices.service";
import { DevicesController } from "./api/devices.controller";
import { Device, DeviceSchema } from "./domain/mongo-schemas/device-schema-Model";
import { JwtService } from "../auth/application/jwt.service";
import { RefreshGuard } from "../../guards/jwt-auth-refresh.guard";
import { CqrsModule } from "@nestjs/cqrs";
import { DeleteDevicesHandler } from "./application/use-cases/handlers/delete-devices-handler";
import { DeleteDeviceByIdHandler } from "./application/use-cases/handlers/delete-device-by-id-handler";
import { DeviceRepository } from "./interfaces/IDeviceRepository";
import { DeviceQueryRepository } from "./interfaces/IDeviceQueryRepository";

const handlers = [DeleteDevicesHandler, DeleteDeviceByIdHandler];
const adapters = [
  DeviceRepository(),
  DeviceQueryRepository(),
  // DeviceRepositories, // mongo
  // DeviceQueryRepositories, // mongo
  // DeviceSqlRepositories, // sql
  // DeviceSqlQueryRepositories, // sql
  JwtService
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    CqrsModule
  ],
  controllers: [DevicesController],
  providers: [DevicesService, RefreshGuard, ...adapters, ...handlers]
})
export class DeviceModule {
}
