import { IsNotEmpty, IsString } from "class-validator";
import { Trim } from "../../../../helpers/decorator-trim";

export class LoginDto {
  /**
   * login: Login or Email  -  User
   */
  @Trim()
  @IsNotEmpty()
  @IsString()
  loginOrEmail: string;
  /**
   * password: password User
   */
  @Trim()
  @IsNotEmpty()
  @IsString()
  password: string;
}
