import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  HttpCode,
  UseGuards,
  Res,
  Ip
} from "@nestjs/common";
import { CreateUserDto } from "../../users/api/input-Dto/create-User-Dto-Model";
import { ConfirmationCodeDto } from "../../users/api/input-Dto/confirmation-code-Dto-Model";
import { LoginDto } from "./input-dtos/login-Dto-Model";
import { EmailRecoveryDto } from "./input-dtos/email-Recovery-Dto-Model";
import { NewPasswordDto } from "./input-dtos/new-Password-Dto-Model";
import { TokensType } from "../application/jwt.service";
import { PayloadType } from "../application/payloadType";
import { RefreshGuard } from "../../../guards/jwt-auth-refresh.guard";
import { Response } from "express";
import { PayloadRefresh } from "../../../decorators/payload-refresh.param.decorator";
import { JwtAuthGuard } from "../../../guards/jwt-auth-bearer.guard";
import { UsersQueryRepositories } from "../../users/infrastructure/query-reposirory/users-query.reposit";
import { MeViewModel } from "../infrastructure/me-View-Model";
import { CurrentUserId } from "../../../decorators/current-user-id.param.decorator";
import { ThrottlerGuard } from "@nestjs/throttler";
import { CommandBus } from "@nestjs/cqrs";
import { CreateUserCommand } from "../../users/application/use-cases/create-user-command";
import { LogoutCommand } from "../application/use-cases/logout-command";
import { ResendingCommand } from "../application/use-cases/resending-command";
import { ConfirmByCodeCommand } from "../application/use-cases/confirmation-by-code-command";
import { NewPasswordCommand } from "../application/use-cases/new-password-command";
import { RecoveryCommand } from "../application/use-cases/recovery-command";
import { LoginCommand } from "../application/use-cases/login-command";
import { RefreshCommand } from "../application/use-cases/refresh-command";

@Controller(`auth`)
export class AuthController {
  constructor(private readonly usersQueryRepositories: UsersQueryRepositories,
              private commandBus: CommandBus) {
  }

  @HttpCode(204)
  @Post(`/password-recovery`)
  async recovery(@Body() emailInputModel: EmailRecoveryDto): Promise<boolean> {
    return await this.commandBus.execute(new RecoveryCommand(emailInputModel));
  }

  @HttpCode(204)
  @Post(`/new-password`)
  async newPassword(@Body() newPasswordInputModel: NewPasswordDto): Promise<boolean> {
    return await this.commandBus.execute(new NewPasswordCommand(newPasswordInputModel));
  }

  @HttpCode(200)
  @Post(`/login`)
  async login(@Request() req, @Ip() ip, @Body() loginInputModel: LoginDto,
              @Res({ passthrough: true }) res: Response): Promise<Pick<TokensType, "accessToken">> {
    const deviceName = req.headers["user-agent"];
    const createdToken = await this.commandBus.execute(new LoginCommand(loginInputModel, ip, deviceName));
    res.cookie("refreshToken", createdToken.refreshToken, { httpOnly: true, secure: true });
    return { accessToken: createdToken.accessToken };
  }

  @UseGuards(ThrottlerGuard)
  @HttpCode(200)
  @UseGuards(RefreshGuard)
  @Post(`refresh-token`)
  async refresh(@PayloadRefresh() payloadRefresh: PayloadType,
                @Res({ passthrough: true }) res): Promise<Pick<TokensType, "accessToken">> {
    const createdToken = await this.commandBus.execute(new RefreshCommand(payloadRefresh));
    res.cookie("refreshToken", createdToken.refreshToken, { httpOnly: true, secure: true });
    return { accessToken: createdToken.accessToken };
  }

  @HttpCode(204)
  @Post(`/registration-confirmation`)
  async confirmByCode(@Body() codeInputModel: ConfirmationCodeDto): Promise<boolean> {
    return await this.commandBus.execute(new ConfirmByCodeCommand(codeInputModel));
  }

  @HttpCode(204)
  @Post(`/registration`)
  async registration(@Body() userInputModel: CreateUserDto): Promise<boolean> {
    await this.commandBus.execute(new CreateUserCommand(userInputModel));
    return;
  }

  @HttpCode(204)
  @Post(`/registration-email-resending`)
  async resending(@Body() resendingInputModel: EmailRecoveryDto): Promise<boolean> {
    return await this.commandBus.execute(new ResendingCommand(resendingInputModel));
  }

  @UseGuards(ThrottlerGuard)
  @UseGuards(RefreshGuard)
  @HttpCode(204)
  @Post(`/logout`)
  async logout(@PayloadRefresh() payloadRefresh: PayloadType): Promise<boolean> {
    return await this.commandBus.execute(new LogoutCommand(payloadRefresh));
  }

  @UseGuards(ThrottlerGuard)
  @UseGuards(JwtAuthGuard)
  @Get(`me`)
  async getProfile(@CurrentUserId() userId: string): Promise<MeViewModel> {
    return await this.usersQueryRepositories.getUserById(userId);
  }
}
