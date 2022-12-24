import { UpdateBanInfoForUserDto } from "../../api/input-dtos/update-ban-info-for-User-Dto-Model";

export class UpdateBanUserForCurrentBlogCommand {
  constructor(public readonly userId: string,
              public readonly id: string,
              public readonly banUserForCurrentBlogInputModel: UpdateBanInfoForUserDto) {

  }

}