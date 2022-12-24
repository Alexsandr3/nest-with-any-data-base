import { Controller, Delete, HttpCode } from '@nestjs/common';
import { TestingService } from './testing.service';

@Controller(`testing`)
export class TestingController {
  constructor(protected testingService: TestingService) {}

  @Delete(`/all-data`)
  @HttpCode(204)
  async deleteDB() {
    return await this.testingService.deleteAll();
  }
}
