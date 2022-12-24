import { UpdateBlogDto } from '../../api/input-dtos/update-Blog-Dto-Model';

export class UpdateBlogCommand {
  constructor(
    public readonly userId: string,
    public readonly blogId: string,
    public readonly blogInputModel: UpdateBlogDto,
  ) {}
}
