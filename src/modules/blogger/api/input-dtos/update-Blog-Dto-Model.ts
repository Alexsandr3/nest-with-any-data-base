import { IsString, IsUrl, Length } from 'class-validator';
import { Trim } from "../../../../helpers/decorator-trim";

export class UpdateBlogDto {
  /**
   * name: Blog name for update
   */
  @Trim()
  @Length(1, 15)
  @IsString()
  name: string;
  /**
   * description
   */
  @Trim()
  @Length(1, 500)
  @IsString()
  description: string;
  /**
   * websiteUrl: Blog website Url
   */
  @Trim()
  @Length(1, 100)
  @IsUrl()
  @IsString()
  websiteUrl: string;
}
