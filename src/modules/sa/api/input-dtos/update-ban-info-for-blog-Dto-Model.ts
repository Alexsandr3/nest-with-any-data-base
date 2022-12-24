import { IsBoolean, IsOptional } from "class-validator";

export class UpdateBanInfoForBlogDto {
  /**
   * isBanned: "boolean" for update status ban or unban User
   */
  @IsBoolean()
  @IsOptional()
  isBanned = true;
}
