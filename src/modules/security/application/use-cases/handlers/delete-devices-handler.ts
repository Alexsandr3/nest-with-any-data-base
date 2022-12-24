import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteDevicesCommand } from '../delete-devices-command';
import { DeviceRepositories } from '../../../infrastructure/device-repositories';

@CommandHandler(DeleteDevicesCommand)
export class DeleteDevicesHandler
  implements ICommandHandler<DeleteDevicesCommand>
{
  constructor(private readonly deviceRepositories: DeviceRepositories) {}

  async execute(command: DeleteDevicesCommand): Promise<boolean> {
    const { userId, deviceId } = command.payloadRefresh;
    await this.deviceRepositories.deleteDevices(userId, deviceId);
    return true;
  }
}
