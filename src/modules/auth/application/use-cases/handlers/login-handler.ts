import { UnauthorizedExceptionMY } from '../../../../../helpers/My-HttpExceptionFilter';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceRepositories } from '../../../../security/infrastructure/device-repositories';
import { LoginCommand } from '../login-command';
import { UsersService } from '../../../../users/domain/users.service';
import { JwtService, TokensType } from '../../jwt.service';
import { UsersRepositories } from '../../../../users/infrastructure/users-repositories';
import { LoginDto } from '../../../api/input-dtos/login-Dto-Model';
import { UsersDBType } from '../../../../users/domain/user-DB-Type';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PreparationDeviceForDB } from '../../../../security/domain/device-preparation-for-DB';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly deviceRepositories: DeviceRepositories,
    private readonly usersRepositories: UsersRepositories,
  ) {}

  private async validateUser(loginInputModel: LoginDto): Promise<UsersDBType> {
    //find user by login or email
    const user = await this.usersRepositories.findByLoginOrEmail(loginInputModel.loginOrEmail,);
    if (!user) throw new UnauthorizedExceptionMY(`User '${loginInputModel.loginOrEmail}' is not authorized `,);
    //check passwordHash
    const result = await bcrypt.compare(
      loginInputModel.password,
      user.accountData.passwordHash,
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
    const foundUser = await this.usersRepositories.findBanStatusUser(
      user._id.toString(),
    );
    if (foundUser.banInfo.isBanned === true) {
      //deleting a devices-sessions if the user is banned
      await this.deviceRepositories.deleteDevicesForBannedUser(foundUser.id);
      throw new UnauthorizedExceptionMY(`Did you get a ban!`);
    }
    //preparation data for token
    const deviceId = randomUUID();
    const userId = user._id.toString();
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
}
