import { UnauthorizedExceptionMY } from '../../../../../helpers/My-HttpExceptionFilter';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from '../logout-command';
import { Inject } from "@nestjs/common";
import { IDeviceRepository, IDeviceRepositoryKey } from "../../../../security/interfaces/IDeviceRepository";

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(@Inject(IDeviceRepositoryKey)
              private readonly deviceRepositories: IDeviceRepository) {}

  async execute(command: LogoutCommand): Promise<boolean> {
    const { userId, deviceId, iat } = command.payloadRefresh;
    const dateCreatedToken = new Date(iat * 1000).toISOString();
    //search device
    const foundDevice = await this.deviceRepositories.findDeviceForDelete(
      userId,
      deviceId,
      dateCreatedToken,
    );
    if (!foundDevice) throw new UnauthorizedExceptionMY('not today sorry man');
    //removing device
    const isDeleted = await this.deviceRepositories.deleteDevice(
      userId,
      deviceId,
    );
    if (!isDeleted) throw new UnauthorizedExceptionMY('not today');
    return true;
  }
}
