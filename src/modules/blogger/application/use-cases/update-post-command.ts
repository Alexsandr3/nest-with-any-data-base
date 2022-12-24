import { CreatePostDto } from '../../../posts/api/input-Dtos/create-Post-Dto-Model';

export class UpdatePostCommand {
  constructor(
    public readonly userId: string,
    public readonly blogId: string,
    public readonly postId: string,
    public readonly postInputModel: CreatePostDto,
  ) {}
}
