import { IsString, Length } from 'class-validator';
import { Trim } from "../../../../helpers/decorator-trim";

export class CreatePostDto {
  /**
   * Title for create Post
   */
  @Trim()
  @Length(1, 30)
  @IsString()
  title: string;
  /**
   * Short description for create Post
   */
  @Trim()
  @Length(1, 100)
  @IsString()
  shortDescription: string;
  /**
   * content for create Post
   */
  @Trim()
  @Length(1, 1000)
  @IsString()
  content: string;
}
