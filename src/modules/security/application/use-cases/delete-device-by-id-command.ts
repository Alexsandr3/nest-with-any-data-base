import { PayloadType } from '../../../auth/application/payloadType';

export class DeleteDeviceByIdCommand {
  constructor(
    public readonly id: string,
    public readonly payloadRefresh: PayloadType,
  ) {}
}
