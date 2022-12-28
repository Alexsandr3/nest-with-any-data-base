import { UnauthorizedExceptionMY } from '../../../../../helpers/My-HttpExceptionFilter';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from '../login-command';
import { UsersService } from '../../../../users/domain/users.service';
import { JwtService, TokensType } from '../../jwt.service';
import { LoginDto } from '../../../api/input-dtos/login-Dto-Model';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PreparationDeviceForDB } from '../../../../security/domain/device-preparation-for-DB';
import { UsersSqlRepositories } from "../../../../users/infrastructure/users-sql-repositories";
import { UserDBSQLType } from "../../../../users/infrastructure/user-DB-SQL-Type";
import { DeviceSqlRepositories } from "../../../../security/infrastructure/device-sql-repositories";

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly deviceSqlRepositories: DeviceSqlRepositories,
    private readonly usersSqlRepositories: UsersSqlRepositories,
  ) {}

  private async validateUser(loginInputModel: LoginDto): Promise<UserDBSQLType> {
    //find user by login or email
    const user = await this.usersSqlRepositories.findByLoginOrEmail(loginInputModel.loginOrEmail,);
    if (!user) throw new UnauthorizedExceptionMY(`User '${loginInputModel.loginOrEmail}' is not authorized `);
    //check passwordHash
    const result = await bcrypt.compare(
      loginInputModel.password,
      user.passwordHash,
    );
    if (!result) throw new UnauthorizedExceptionMY(`Incorrect password`);
    return user;
  }

  async execute(command: LoginCommand): Promise<TokensType> {
    const { loginInputModel } = command;
    const ipAddress = command.ip;
    const deviceName = command.deviceName;
    //validate user by login or email
    const user = await this.validateUser(loginInputModel);
    //finding user and check ban status
    // const foundUser = await this.usersSqlRepositories.findBanStatusUser(
    //   user.user_id,
    // );
    if (user.isBanned === true) {
      //deleting a devices-sessions if the user is banned
      await this.deviceSqlRepositories.deleteDevicesForBannedUser(user.user_id);
      throw new UnauthorizedExceptionMY(`Did you get a ban!`);
    }
    //preparation data for token
    const deviceId = randomUUID();
    const userId = user.user_id;
    //generation of a new pair of tokens
    const token = await this.jwtService.createJwt(userId, deviceId);
    const payloadNew = await this.jwtService.verifyRefreshToken(
      token.refreshToken,
    );
    //preparation data for save device
    const dateCreatedToken = new Date(payloadNew.iat * 1000).toISOString();
    const dateExpiredToken = new Date(payloadNew.exp * 1000).toISOString();
    const device = new PreparationDeviceForDB(
      userId,
      ipAddress,
      deviceName,
      dateCreatedToken,
      dateExpiredToken,
      deviceId,
    );
    await this.deviceSqlRepositories.createDevice(device);
    return token;
  }
}
