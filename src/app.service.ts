import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `'Hello free Belarus! Don't panic eat draniks'`;
  }
}
