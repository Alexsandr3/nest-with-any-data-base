import { CreateCommentDto } from '../../api/input-Dtos/create-Comment-Dto-Model';

export class CreateCommentCommand {
  constructor(
    public readonly id: string,
    public readonly inputCommentModel: CreateCommentDto,
    public readonly userId: string,
  ) {}
}
