import { NewPasswordDto } from '../../api/input-dtos/new-Password-Dto-Model';

export class NewPasswordCommand {
  constructor(public readonly newPasswordInputModel: NewPasswordDto) {}
}
