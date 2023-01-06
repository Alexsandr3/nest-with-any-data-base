import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteDevicesCommand } from '../delete-devices-command';
import { Inject } from "@nestjs/common";
import { IDeviceRepository, IDeviceRepositoryKey } from "../../../interfaces/IDeviceRepository";

@CommandHandler(DeleteDevicesCommand)
export class DeleteDevicesHandler
  implements ICommandHandler<DeleteDevicesCommand>
{
  constructor(@Inject(IDeviceRepositoryKey)
              private readonly deviceRepositories: IDeviceRepository) {}

  async execute(command: DeleteDevicesCommand): Promise<boolean> {
    const { userId, deviceId } = command.payloadRefresh;
    await this.deviceRepositories.deleteDevices(userId, deviceId);
    return true;
  }
}
