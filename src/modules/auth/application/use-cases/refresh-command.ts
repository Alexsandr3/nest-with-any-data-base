import { PayloadType } from '../payloadType';

export class RefreshCommand {
  constructor(public readonly payloadRefresh: PayloadType) {}
}
