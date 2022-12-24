import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Trim } from "../../../../helpers/decorator-trim";

export class UpdateBanInfoDto {
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
}
