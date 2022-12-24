import { IsEnum, IsOptional } from 'class-validator';
import { LikeStatusType } from '../../domain/likesPost-schema-Model';
import { Trim } from "../../../../helpers/decorator-trim";

export class UpdateLikeStatusDto {
  /**
   * Send "None" if you want to un "like" or "undislike"
   */
  @Trim()
  @IsEnum(LikeStatusType)
  @IsOptional()
  'likeStatus': LikeStatusType = LikeStatusType.None;
}
