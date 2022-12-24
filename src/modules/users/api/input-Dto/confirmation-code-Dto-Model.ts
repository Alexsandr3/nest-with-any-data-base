import { IsString, Length } from 'class-validator';
import { Trim } from "../../../../helpers/decorator-trim";

export class ConfirmationCodeDto {
  /**
   * Code that be sent via Email inside link
   */
  @Trim()
  @Length(1, 100)
  @IsString()
  code: string;
}
