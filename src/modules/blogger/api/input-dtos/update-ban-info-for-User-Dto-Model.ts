import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { Trim } from "../../../../helpers/decorator-trim";
import { IsUuidCustom } from "../../../../helpers/decorator-IsUuid";

export class UpdateBanInfoForUserDto {
  /**
   * isBanned: User
   */
  @IsBoolean()
  @IsOptional()
  isBanned = true;
  /**
   * password: password User
   */
  @Trim()
  @Length(20)
  @IsString()
  banReason: string;
  /**
   * id for Blog
   */
  @Trim()
  @IsNotEmpty()
  // @IsMongoIdObject()
  @IsUuidCustom()
  @IsString()
  blogId: string;
}
