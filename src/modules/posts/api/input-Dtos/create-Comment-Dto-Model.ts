import { IsString, Length } from 'class-validator';
import { Trim } from "../../../../helpers/decorator-trim";

export class CreateCommentDto {
  /**
   * content for create Comment
   */
  @Trim()
  @Length(20, 300)
  @IsString()
  content: string;
}
