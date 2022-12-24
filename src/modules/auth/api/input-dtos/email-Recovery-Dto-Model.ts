import { IsEmail, IsString } from 'class-validator';
import { Trim } from "../../../../helpers/decorator-trim";

export class EmailRecoveryDto {
  /**
   * email: email User for recovery
   */
  @Trim()
  @IsString()
  @IsEmail()
  email: string;
}
