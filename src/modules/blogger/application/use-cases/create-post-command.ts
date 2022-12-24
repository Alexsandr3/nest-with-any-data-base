import { CreatePostDto } from '../../../posts/api/input-Dtos/create-Post-Dto-Model';

export class CreatePostCommand {
  constructor(
    public readonly postInputModel: CreatePostDto,
    public readonly blogId: string,
    public readonly userId: string,
  ) {}
}
