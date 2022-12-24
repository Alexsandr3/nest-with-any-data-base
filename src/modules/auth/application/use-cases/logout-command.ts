import { PayloadType } from '../payloadType';

export class LogoutCommand {
  constructor(public readonly payloadRefresh: PayloadType) {}
}
