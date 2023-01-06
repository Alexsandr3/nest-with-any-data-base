import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RefreshCommand } from "../refresh-command";
import { PayloadType } from "../../payloadType";
import { JwtService, TokensType } from "../../jwt.service";
import { Inject } from "@nestjs/common";
import { IDeviceRepository, IDeviceRepositoryKey } from "../../../../security/interfaces/IDeviceRepository";

@CommandHandler(RefreshCommand)
export class RefreshHandler implements ICommandHandler<RefreshCommand> {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(IDeviceRepositoryKey)
    private readonly deviceRepositories: IDeviceRepository
  ) {
  }

  async execute(command: RefreshCommand): Promise<TokensType> {
    const { userId, deviceId, iat } = command.payloadRefresh;
    //generation of a new pair of tokens
    const newTokens: TokensType = await this.jwtService.createJwt(
      userId,
      deviceId
    );
    const payloadNew: PayloadType = await this.jwtService.verifyRefreshToken(newTokens.refreshToken);
    //preparation data for update device in DB
    //const userId = payloadNew.userId;
    //const deviceId = payloadNew.deviceId;
    const dateCreatedOldToken = new Date(iat * 1000).toISOString();
    const dateCreateToken = new Date(payloadNew.iat * 1000).toISOString();
    const dateExpiredToken = new Date(payloadNew.exp * 1000).toISOString();
    await this.deviceRepositories.updateDateDevice(
      userId,
      deviceId,
      dateCreateToken,
      dateExpiredToken,
      dateCreatedOldToken
    );
    return newTokens;
  }
}
