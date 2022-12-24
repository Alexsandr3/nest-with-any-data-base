import { Module } from "@nestjs/common";
import { MailModule } from "../mail/mail.module";
import { UsersModule } from "../users/usersModule";
import { AuthController } from "./api/auth.controller";
import { AuthService } from "./domain/auth.service";
import { JwtService } from "./application/jwt.service";
import { UsersService } from "../users/domain/users.service";
import { DeviceRepositories } from "../security/infrastructure/device-repositories";
import { UsersQueryRepositories } from "../users/infrastructure/query-reposirory/users-query.reposit";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../users/domain/users-schema-Model";
import { Device, DeviceSchema } from "../security/domain/device-schema-Model";
import { RefreshGuard } from "../../guards/jwt-auth-refresh.guard";
import { JwtAuthGuard } from "../../guards/jwt-auth-bearer.guard";
import { UsersRepositories } from "../users/infrastructure/users-repositories";
import { CqrsModule } from "@nestjs/cqrs";
import { CreateUserHandler } from "../users/application/use-cases/handlers/create-user-handler";
import { LogoutHandler } from "./application/use-cases/handlers/logout-handler";
import { ResendingHandler } from "./application/use-cases/handlers/resending-handler";
import { ConfirmByCodeHandler } from "./application/use-cases/handlers/confirmation-by-code-handler";
import { NewPasswordHandler } from "./application/use-cases/handlers/new-password-handler";
import { RecoveryHandler } from "./application/use-cases/handlers/recovery-handler";
import { LoginHandler } from "./application/use-cases/handlers/login-handler";
import { RefreshHandler } from "./application/use-cases/handlers/refresh-handler";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

const handlers = [
  CreateUserHandler,
  LogoutHandler,
  ResendingHandler,
  ConfirmByCodeHandler,
  NewPasswordHandler,
  RecoveryHandler,
  LoginHandler,
  RefreshHandler
];
const adapters = [
  JwtService,
  DeviceRepositories,
  UsersRepositories,
  UsersQueryRepositories
];
const guards = [RefreshGuard, JwtAuthGuard];

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
    /*    JwtModule.register({
          secret: settings.ACCESS_TOKEN_SECRET,
          signOptions: { expiresIn: '15m' },
        }),*/
    MailModule,
    CqrsModule,
    UsersModule

  ],
  controllers: [AuthController],
  providers: [UsersService, AuthService, ...adapters, ...guards, ...handlers, ThrottlerGuard],
  exports: [JwtService]
})
export class AuthModule {
}
