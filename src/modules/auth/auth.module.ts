import { Module } from "@nestjs/common";
import { MailModule } from "../mail/mail.module";
import { UsersModule } from "../users/usersModule";
import { AuthController } from "./api/auth.controller";
import { AuthService } from "./domain/auth.service";
import { JwtService } from "./application/jwt.service";
import { UsersService } from "../users/domain/users.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../users/domain/mongo-schemas/users-schema-Model";
import { Device, DeviceSchema } from "../security/domain/mongo-schemas/device-schema-Model";
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
import { ThrottlerModule } from "@nestjs/throttler";
import { DeviceRepository } from "../security/interfaces/IDeviceRepository";
import { UserRepository } from "../users/interfaces/IUserRepository";
import { UserQueryRepository } from "../users/interfaces/IUserQueryRepository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Usser } from "../../entities/user.entity";
import { EmailConfirmation } from "../../entities/emailConfirmation.entity";
import { EmailRecovery } from "../../entities/emailRecovery.entity";
import { DeviceT } from "../../entities/device.entity";

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
  DeviceRepository(),
  UserRepository(),
  UserQueryRepository(),
  // DeviceSqlRepositories, // sql
  // UsersSqlRepositories, // sql
  // UsersSqlQueryRepositories, // sql
  // DeviceRepositories, // mongo
  UsersRepositories // mongo
  // UsersQueryRepositories // mongo
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
      { name: Device.name, schema: DeviceSchema }
    ]),

    TypeOrmModule.forFeature([Usser, EmailConfirmation, EmailRecovery, DeviceT]),
    /*    JwtModule.register({
          secret: settings.ACCESS_TOKEN_SECRET,
          signOptions: { expiresIn: '15m' },
        }),*/
    MailModule,
    CqrsModule,
    UsersModule

  ],
  controllers: [AuthController],
  providers: [UsersService, AuthService, ...adapters, ...guards, ...handlers
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard
    // }
  ],
  exports: [JwtService]
})
export class AuthModule {
}
