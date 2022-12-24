import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from "../../../../helpers/decorator-trim";

export class CreateUserDto {
  /**
   * login: Login for create/registration User
   */
  @Trim()
  @Length(3, 10)
  @IsString()
  login: string;
  /**
   * password: password for create/registration User
   */
  @Trim()
  @Length(6, 20)
  @IsString()
  password: string;
  /**
   * email: email for create/registration User
   */
  @Trim()
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
}
