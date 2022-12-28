import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteDevicesCommand } from '../delete-devices-command';
import { DeviceSqlRepositories } from "../../../infrastructure/device-sql-repositories";

@CommandHandler(DeleteDevicesCommand)
export class DeleteDevicesHandler
  implements ICommandHandler<DeleteDevicesCommand>
{
  constructor(private readonly deviceRepositories: DeviceSqlRepositories) {}

  async execute(command: DeleteDevicesCommand): Promise<boolean> {
    const { userId, deviceId } = command.payloadRefresh;
    await this.deviceRepositories.deleteDevices(userId, deviceId);
    return true;
  }
}
