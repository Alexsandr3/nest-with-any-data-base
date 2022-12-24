import { EmailRecoveryDto } from '../../api/input-dtos/email-Recovery-Dto-Model';

export class RecoveryCommand {
  constructor(public readonly emailInputModel: EmailRecoveryDto) {}
}
