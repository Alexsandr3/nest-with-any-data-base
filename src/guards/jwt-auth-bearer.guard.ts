import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '../modules/auth/application/jwt.service';
import { UnauthorizedExceptionMY } from '../helpers/My-HttpExceptionFilter';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.getToken(request);
    const userId = await this.jwtService.getUserIdByToken(token);
    if (!userId) {
      throw new UnauthorizedExceptionMY(
        `Unauthorized user, did not come current userId`,
      );
    }
    request.userId = userId;
    return true;
  }

  protected getToken(request: {
    headers: Record<string, string | string[]>;
  }): string {
    const authorization = request.headers['authorization'];
    if (!authorization || Array.isArray(authorization)) {
      throw new UnauthorizedExceptionMY('Did not come accessToken');
    }
    const [_, token] = authorization.split(' '); // const token = req.headers.authorization.split(' ')[1]
    return token;
  }
}
