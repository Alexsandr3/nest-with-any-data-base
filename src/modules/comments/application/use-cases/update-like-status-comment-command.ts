import { UpdateLikeStatusDto } from '../../../posts/api/input-Dtos/update-Like-Status-Model';

export class UpdateLikeStatusCommentCommand {
  constructor(
    public readonly id: string,
    public readonly updateLikeStatusInputModel: UpdateLikeStatusDto,
    public readonly userId: string,
  ) {}
}
