import { CreateUserDto } from "../../api/input-Dto/create-User-Dto-Model";


export class CreateUserSaCommand {
  constructor(public readonly userInputModel: CreateUserDto) {}
}
