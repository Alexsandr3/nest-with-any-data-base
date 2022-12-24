import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DevicesService } from './domain/devices.service';
import { DeviceRepositories } from './infrastructure/device-repositories';
import { DevicesController } from './api/devices.controller';
import { Device, DeviceSchema } from './domain/device-schema-Model';
import { DeviceQueryRepositories } from './infrastructure/query-repository/device-query.repositories';
import { JwtService } from '../auth/application/jwt.service';
import { RefreshGuard } from '../../guards/jwt-auth-refresh.guard';
import { CqrsModule } from '@nestjs/cqrs';
import { DeleteDevicesHandler } from './application/use-cases/handlers/delete-devices-handler';
import { DeleteDeviceByIdHandler } from './application/use-cases/handlers/delete-device-by-id-handler';

const handlers = [DeleteDevicesHandler, DeleteDeviceByIdHandler];
const adapters = [DeviceRepositories, DeviceQueryRepositories, JwtService];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    CqrsModule,
  ],
  controllers: [DevicesController],
  providers: [DevicesService, RefreshGuard, ...adapters, ...handlers],
})
export class DeviceModule {}
