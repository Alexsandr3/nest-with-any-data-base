import {
  Controller,
  Delete,
  Get,
  HttpCode, Inject,
  Param,
  UseGuards
} from "@nestjs/common";
import { RefreshGuard } from "../../../guards/jwt-auth-refresh.guard";
import { DeviceViewModel } from "../infrastructure/query-repository/types-view/device-View-Model";
import { PayloadRefresh } from "../../../decorators/payload-refresh.param.decorator";
import { PayloadType } from "../../auth/application/payloadType";
import { CurrentUserIdDevice } from "../../../decorators/current-device.param.decorator";
import { CommandBus } from "@nestjs/cqrs";
import { DeleteDevicesCommand } from "../application/use-cases/delete-devices-command";
import { DeleteDeviceByIdCommand } from "../application/use-cases/delete-device-by-id-command";
import { SkipThrottle } from "@nestjs/throttler";
import { IDeviceQueryRepository, IDeviceQueryRepositoryKey } from "../interfaces/IDeviceQueryRepository";

@SkipThrottle()
@Controller(`security`)
export class DevicesController {
  constructor(private commandBus: CommandBus,
              @Inject(IDeviceQueryRepositoryKey)
              private readonly deviceQueryRepositories: IDeviceQueryRepository) {
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
  //@UsePipes(new ValidateUuidPipe())
  @HttpCode(204)
  @Delete(`/devices/:deviceId`)
  async deleteByDeviceId(@PayloadRefresh() payloadRefresh: PayloadType,
                         @Param(`deviceId`) inputId: string): Promise<boolean> {
    return await this.commandBus.execute(new DeleteDeviceByIdCommand(inputId, payloadRefresh));
  }
}
