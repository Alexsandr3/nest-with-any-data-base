import { CreateUserDto } from '../../api/input-Dto/create-User-Dto-Model';

export class CreateUserCommand {
  constructor(public readonly userInputModel: CreateUserDto) {}
}
