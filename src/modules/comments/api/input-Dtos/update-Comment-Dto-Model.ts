import { IsString, Length } from 'class-validator';
import { Trim } from "../../../../helpers/decorator-trim";

export class UpdateCommentDto {
  /**
   * description for update comment
   */
  @Trim()
  @Length(20, 300)
  @IsString()
  content: string;
}
