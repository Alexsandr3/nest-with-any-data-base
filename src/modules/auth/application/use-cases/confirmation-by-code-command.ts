import { ConfirmationCodeDto } from '../../../users/api/input-Dto/confirmation-code-Dto-Model';

export class ConfirmByCodeCommand {
  constructor(public readonly codeInputModel: ConfirmationCodeDto) {}
}
