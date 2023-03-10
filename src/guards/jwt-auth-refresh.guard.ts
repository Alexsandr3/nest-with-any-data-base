import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { JwtService } from '../modules/auth/application/jwt.service';
import { UnauthorizedExceptionMY } from '../helpers/My-HttpExceptionFilter';
import { IDeviceRepository, IDeviceRepositoryKey } from "../modules/security/interfaces/IDeviceRepository";

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(IDeviceRepositoryKey)
    private readonly deviceRepositories: IDeviceRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      throw new UnauthorizedExceptionMY(`Did not come refreshToken`);
    //verify payload refresh token
    const payload = await this.jwtService.verifyRefreshToken(refreshToken);
    //check token for expiration date
    const dateExp = new Date(payload.exp * 1000);
    if (dateExp < new Date()) throw new UnauthorizedExceptionMY(`Expired date`);
    //check validate device
    const deviceUser = await this.deviceRepositories.findDeviceForValid(
      payload.userId,
      payload.deviceId,
      payload.iat,
    );
    if (!deviceUser)
      throw new UnauthorizedExceptionMY(
        `Incorrect userId or deviceId or issuedAt`,
      );
    req.payload = payload;
    return true;
  }
}
