import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  UseGuards
} from "@nestjs/common";
import { DeviceQueryRepositories } from "../infrastructure/query-repository/device-query.repositories";
import { RefreshGuard } from "../../../guards/jwt-auth-refresh.guard";
import { DeviceViewModel } from "../infrastructure/query-repository/device-View-Model";
import { PayloadRefresh } from "../../../decorators/payload-refresh.param.decorator";
import { PayloadType } from "../../auth/application/payloadType";
import { CurrentUserIdDevice } from "../../../decorators/current-device.param.decorator";
import { CommandBus } from "@nestjs/cqrs";
import { DeleteDevicesCommand } from "../application/use-cases/delete-devices-command";
import { DeleteDeviceByIdCommand } from "../application/use-cases/delete-device-by-id-command";
import { DeviceIdDto } from "./input-dtos/deviceId-Dto-Model";

@Controller(`security`)
export class DevicesController {
  constructor(private commandBus: CommandBus,
              private readonly deviceQueryRepositories: DeviceQueryRepositories) {
  }

  @UseGuards(RefreshGuard)
  @Get(`/devices`)
  async findDevices(@CurrentUserIdDevice() userId: string): Promise<DeviceViewModel[]> {
    return await this.deviceQueryRepositories.findDevices(userId);
  }

  @UseGuards(RefreshGuard)
  @HttpCode(204)
  @Delete(`/devices`)
  async deleteDevices(@PayloadRefresh() payloadRefresh: PayloadType): Promise<boolean> {
    return await this.commandBus.execute(new DeleteDevicesCommand(payloadRefresh));
  }

  @UseGuards(RefreshGuard)
  @HttpCode(204)
  @Delete(`/devices/:deviceId`)
  async deleteByDeviceId(@PayloadRefresh() payloadRefresh: PayloadType,
                         @Param(`deviceId`) inputId: DeviceIdDto): Promise<boolean> {
    return await this.commandBus.execute(new DeleteDeviceByIdCommand(inputId.deviceId, payloadRefresh));
  }
}
