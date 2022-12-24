import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor() {}

  /* private async validateUser(loginInputModel: LoginDto): Promise<UsersDBType> {
     //find user by login or email
     const user = await this.usersRepositories.findByLoginOrEmail(loginInputModel.loginOrEmail);
     if (!user) throw new UnauthorizedExceptionMY(`User '${loginInputModel.loginOrEmail}' is not authorized `);
     //check passwordHash
     const result = await bcrypt.compare(loginInputModel.password, user.accountData.passwordHash);
     if (!result) throw new UnauthorizedExceptionMY(`Incorrect password`);
     return user;
   }

   async login(loginInputModel: LoginDto, ipAddress: string, deviceName: string): Promise<TokensType> {
     const user = await this.validateUser(loginInputModel);
     //preparation data for token
     const deviceId = randomUUID();
     const userId = user._id.toString();
     //generation of a new pair of tokens
     const token = await this.jwtService.createJwt(userId, deviceId);
     const payloadNew = await this.jwtService.verifyRefreshToken(token.refreshToken);
     //preparation data for save device
     const dateCreatedToken = (new Date(payloadNew.iat * 1000)).toISOString();
     const dateExpiredToken = (new Date(payloadNew.exp * 1000)).toISOString();
     const device = new PreparationDeviceForDB(
       userId,
       ipAddress,
       deviceName,
       dateCreatedToken,
       dateExpiredToken,
       deviceId
     );
     await this.deviceRepositories.createDevice(device);
     return token;
   }*/
}
