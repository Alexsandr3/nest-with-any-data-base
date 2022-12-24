import { CreateBlogDto } from '../../api/input-dtos/create-Blog-Dto-Model';

export class CreateBlogCommand {
  constructor(
    public readonly userId: string,
    public readonly blogInputModel: CreateBlogDto,
  ) {}
}
