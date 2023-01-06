import { UnauthorizedExceptionMY } from '../../../../../helpers/My-HttpExceptionFilter';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from '../login-command';
import { UsersService } from '../../../../users/domain/users.service';
import { JwtService, TokensType } from '../../jwt.service';
import { LoginDto } from '../../../api/input-dtos/login-Dto-Model';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PreparationDeviceForDB } from '../../../../security/domain/types/device-preparation-for-DB';
import { UserDBSQLType } from "../../../../users/domain/types/user-DB-SQL-Type";
import { Inject } from "@nestjs/common";
import { IDeviceRepository, IDeviceRepositoryKey } from "../../../../security/interfaces/IDeviceRepository";
import { IUserRepository, IUserRepositoryKey } from "../../../../users/interfaces/IUserRepository";

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(IDeviceRepositoryKey)
    private readonly deviceRepositories: IDeviceRepository,
    @Inject(IUserRepositoryKey)
    private readonly usersRepositories: IUserRepository,
  ) {}

  async execute(command: LoginCommand): Promise<TokensType> {
    const { loginInputModel } = command;
    const ipAddress = command.ip;
    const deviceName = command.deviceName;
    //validate user by login or email
    const user = await this.validateUser(loginInputModel);
    //finding user and check ban status
    if (user.isBanned === true) {
      //deleting a devices-sessions if the user is banned
      await this.deviceRepositories.deleteDevicesForBannedUser(user.userId);
      throw new UnauthorizedExceptionMY(`Did you get a ban!`);
    }
    //preparation data for token
    const deviceId = randomUUID();
    const userId = user.userId;
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
    await this.deviceRepositories.createDevice(device);
    return token;
  }

  private async validateUser(loginInputModel: LoginDto): Promise<UserDBSQLType> {
    //find user by login or email
    const user = await this.usersRepositories.findByLoginOrEmail(loginInputModel.loginOrEmail);
    if (!user) throw new UnauthorizedExceptionMY(`User '${loginInputModel.loginOrEmail}' is not authorized `);
    //check passwordHash
    const result = await bcrypt.compare(
      loginInputModel.password,
      user.passwordHash,
    );
    if (!result) throw new UnauthorizedExceptionMY(`Incorrect password`);
    return user;
  }
}
