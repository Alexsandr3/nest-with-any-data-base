import { EmailRecoveryDto } from '../../api/input-dtos/email-Recovery-Dto-Model';

export class ResendingCommand {
  constructor(public readonly resendingInputModel: EmailRecoveryDto) {}
}
