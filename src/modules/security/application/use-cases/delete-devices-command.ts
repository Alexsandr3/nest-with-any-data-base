import { PayloadType } from '../../../auth/application/payloadType';

export class DeleteDevicesCommand {
  constructor(public readonly payloadRefresh: PayloadType) {}
}
